"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractResumeText, validateResumeFile } from "@/lib/resumes/extractText";
import { parseResumeText } from "@/lib/ai/resumeParser";
import { analyzeResumeQuality } from "@/lib/ai/resumeQualityAnalyzer";
import { RESUME_PARSER_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { RESUME_QUALITY_PROMPT_VERSION } from "@/lib/ai/resumeQualityAnalyzer";
import { currentModelLabel } from "@/lib/ai/models";
import type { FormActionState } from "@/lib/actions/careerProfile";

export async function uploadResumeAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PDF or DOCX file to upload." };
  }

  const validationError = validateResumeFile(file);
  if (validationError) {
    return { error: validationError };
  }

  let rawText: string;
  try {
    rawText = await extractResumeText(file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to read this file." };
  }

  const filePath = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, { contentType: file.type });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const title = formData.get("title");
  const { data: inserted, error: insertError } = await supabase
    .from("master_resumes")
    .insert({
      user_id: user.id,
      title: typeof title === "string" && title.trim() ? title.trim() : file.name,
      file_path: filePath,
      file_type: file.type,
      raw_text: rawText,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: insertError?.message ?? "Failed to save resume" };
  }

  await supabase
    .from("master_resumes")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .neq("id", inserted.id);

  revalidatePath("/resumes");
  return { success: true };
}

export async function parseResumeIntoCareerDnaAction(resumeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: resume } = await supabase
    .from("master_resumes")
    .select("id, raw_text")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!resume?.raw_text) {
    return { error: "Resume text not available" };
  }

  let parsed;
  try {
    parsed = await parseResumeText(resume.raw_text);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to parse resume",
    };
  }

  const { error: updateError } = await supabase
    .from("master_resumes")
    .update({ parsed_content: parsed })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    type: "resume_parser",
    model: currentModelLabel(),
    prompt_version: RESUME_PARSER_PROMPT_VERSION,
    input_reference: { resumeId },
    output: parsed,
  });

  revalidatePath("/resumes");
  return { success: true };
}

/**
 * Imports parsed resume content into the user's Career DNA tables. Additive
 * only - never overwrites existing experiences/skills, so this is safe to
 * run multiple times without duplicating data the user has already edited.
 * Experience rows ARE duplicated if run twice for the same resume parse,
 * since there's no natural dedup key; the UI only offers this once per
 * unimported resume to avoid that in practice.
 */
export async function importParsedResumeAction(resumeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: resume } = await supabase
    .from("master_resumes")
    .select("id, parsed_content")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .maybeSingle();

  const parsed = resume?.parsed_content as
    | {
        headline: string | null;
        professionalSummary: string | null;
        currentTitle: string | null;
        currentCompany: string | null;
        currentLocation: string | null;
        yearsOfExperience: number | null;
        experiences: Array<{
          company: string | null;
          title: string | null;
          location: string | null;
          startDate: string | null;
          endDate: string | null;
          isCurrent: boolean;
          description: string | null;
          responsibilities: string[];
          achievements: string[];
        }>;
        skills: Array<{
          skill: string | null;
          category: string | null;
          proficiency: string | null;
          yearsExperience: number | null;
        }>;
        certifications: Array<{
          name: string | null;
          issuer: string | null;
          issueDate: string | null;
        }>;
        education: Array<{
          institution: string | null;
          degree: string | null;
          field: string | null;
          startDate: string | null;
          endDate: string | null;
        }>;
      }
    | null
    | undefined;

  if (!parsed) {
    return { error: "No parsed resume data to import. Parse the resume first." };
  }

  // The AI parser may legitimately fail to identify a required field on a
  // messy resume (e.g. an education entry with a degree but no clear
  // institution) and returns null for it per its own instructions - those
  // entries have nothing to key an experience/skill/cert/education record
  // on, so they're skipped here rather than failing the whole import.
  const namedExperiences = parsed.experiences.filter(
    (exp): exp is typeof exp & { company: string; title: string } =>
      !!exp.company && !!exp.title,
  );
  const namedCertifications = parsed.certifications.filter(
    (c): c is typeof c & { name: string } => !!c.name,
  );
  const namedEducation = parsed.education.filter(
    (e): e is typeof e & { institution: string } => !!e.institution,
  );

  // Dedupe everything case-insensitively against what's already in Career
  // DNA and against repeats within this same parse: the AI can repeat an
  // entry across resume sections despite being told not to, and
  // re-running import against an already-imported resume (or one parsed
  // twice) shouldn't create duplicate rows either.
  const [
    { data: existingSkills },
    { data: existingExperiences },
    { data: existingCertifications },
    { data: existingEducation },
  ] = await Promise.all([
    supabase.from("career_skills").select("skill").eq("user_id", user.id),
    supabase
      .from("career_experiences")
      .select("company, title, start_date")
      .eq("user_id", user.id),
    supabase.from("career_certifications").select("name").eq("user_id", user.id),
    supabase.from("career_education").select("institution, degree").eq("user_id", user.id),
  ]);

  const existingSkillNames = new Set(
    (existingSkills ?? []).map((s) => s.skill.toLowerCase().trim()),
  );
  const existingExperienceKeys = new Set(
    (existingExperiences ?? []).map((e) =>
      [e.company, e.title, e.start_date ?? ""].join("|").toLowerCase().trim(),
    ),
  );
  const existingCertificationNames = new Set(
    (existingCertifications ?? []).map((c) => c.name.toLowerCase().trim()),
  );
  const existingEducationKeys = new Set(
    (existingEducation ?? []).map((e) =>
      [e.institution, e.degree ?? ""].join("|").toLowerCase().trim(),
    ),
  );

  function dedupeBy<T>(
    items: T[],
    keyOf: (item: T) => string,
    existingKeys: Set<string>,
  ): { kept: T[]; duplicateCount: number } {
    const seen = new Set<string>();
    let duplicateCount = 0;
    const kept = items.filter((item) => {
      const key = keyOf(item);
      if (existingKeys.has(key) || seen.has(key)) {
        duplicateCount++;
        return false;
      }
      seen.add(key);
      return true;
    });
    return { kept, duplicateCount };
  }

  const { kept: experiences, duplicateCount: duplicateExperienceCount } = dedupeBy(
    namedExperiences,
    (exp) => [exp.company, exp.title, exp.startDate ?? ""].join("|").toLowerCase().trim(),
    existingExperienceKeys,
  );
  const { kept: certifications, duplicateCount: duplicateCertificationCount } = dedupeBy(
    namedCertifications,
    (c) => c.name.toLowerCase().trim(),
    existingCertificationNames,
  );
  const { kept: education, duplicateCount: duplicateEducationCount } = dedupeBy(
    namedEducation,
    (e) => [e.institution, e.degree ?? ""].join("|").toLowerCase().trim(),
    existingEducationKeys,
  );

  const seenSkillNames = new Set<string>();
  let duplicateSkillCount = 0;
  let unnamedSkillCount = 0;
  const skills = parsed.skills.filter(
    (s): s is typeof s & { skill: string } => {
      if (!s.skill) {
        unnamedSkillCount++;
        return false;
      }
      const key = s.skill.toLowerCase().trim();
      if (existingSkillNames.has(key) || seenSkillNames.has(key)) {
        duplicateSkillCount++;
        return false;
      }
      seenSkillNames.add(key);
      return true;
    },
  );

  const errors: string[] = [];

  const { error: profileError } = await supabase.from("career_profiles").upsert(
    {
      user_id: user.id,
      headline: parsed.headline ?? undefined,
      professional_summary: parsed.professionalSummary ?? undefined,
      current_title: parsed.currentTitle ?? undefined,
      current_company: parsed.currentCompany ?? undefined,
      current_location: parsed.currentLocation ?? undefined,
      years_of_experience: parsed.yearsOfExperience ?? undefined,
    },
    { onConflict: "user_id" },
  );
  if (profileError) errors.push(`Career profile: ${profileError.message}`);

  if (experiences.length > 0) {
    const { error } = await supabase.from("career_experiences").insert(
      experiences.map((exp) => ({
        user_id: user.id,
        company: exp.company,
        title: exp.title,
        location: exp.location,
        start_date: exp.startDate,
        end_date: exp.isCurrent ? null : exp.endDate,
        is_current: exp.isCurrent,
        description: exp.description,
        responsibilities: exp.responsibilities,
        achievements: exp.achievements,
      })),
    );
    if (error) errors.push(`Experience: ${error.message}`);
  }

  if (skills.length > 0) {
    const { error } = await supabase.from("career_skills").insert(
      skills.map((s) => ({
        user_id: user.id,
        skill: s.skill,
        category: s.category,
        proficiency: s.proficiency,
        years_experience: s.yearsExperience,
      })),
    );
    if (error) errors.push(`Skills: ${error.message}`);
  }

  if (certifications.length > 0) {
    const { error } = await supabase.from("career_certifications").insert(
      certifications.map((c) => ({
        user_id: user.id,
        name: c.name,
        issuer: c.issuer,
        issue_date: c.issueDate,
      })),
    );
    if (error) errors.push(`Certifications: ${error.message}`);
  }

  if (education.length > 0) {
    const { error } = await supabase.from("career_education").insert(
      education.map((e) => ({
        user_id: user.id,
        institution: e.institution,
        degree: e.degree,
        field: e.field,
        start_date: e.startDate,
        end_date: e.endDate,
      })),
    );
    if (error) errors.push(`Education: ${error.message}`);
  }

  revalidatePath("/career-dna");
  revalidatePath("/career-profile");
  revalidatePath("/resumes");

  if (errors.length > 0) {
    return { error: errors.join(" | ") };
  }

  const unnamedExperienceCount = parsed.experiences.length - namedExperiences.length;
  const unnamedCertificationCount = parsed.certifications.length - namedCertifications.length;
  const unnamedEducationCount = parsed.education.length - namedEducation.length;
  const totalUnnamedSkipped =
    unnamedExperienceCount + unnamedSkillCount + unnamedCertificationCount + unnamedEducationCount;
  const totalDuplicateSkipped =
    duplicateExperienceCount + duplicateSkillCount + duplicateCertificationCount + duplicateEducationCount;

  if (
    experiences.length === 0 &&
    skills.length === 0 &&
    certifications.length === 0 &&
    education.length === 0
  ) {
    return totalDuplicateSkipped > 0
      ? {
          error:
            "Nothing new to import - everything usable in this resume is already in your Career DNA.",
        }
      : {
          error:
            "The parsed resume had no usable experience, skills, certifications, or education to import.",
        };
  }

  const imported = {
    experiences: experiences.length,
    skills: skills.length,
    certifications: certifications.length,
    education: education.length,
  };

  const noteParts: string[] = [];
  if (totalUnnamedSkipped > 0) {
    const parts: string[] = [];
    if (unnamedExperienceCount > 0) parts.push(`${unnamedExperienceCount} experience entr${unnamedExperienceCount === 1 ? "y" : "ies"}`);
    if (unnamedSkillCount > 0) parts.push(`${unnamedSkillCount} skill${unnamedSkillCount === 1 ? "" : "s"}`);
    if (unnamedCertificationCount > 0) parts.push(`${unnamedCertificationCount} certification${unnamedCertificationCount === 1 ? "" : "s"}`);
    if (unnamedEducationCount > 0) parts.push(`${unnamedEducationCount} education entr${unnamedEducationCount === 1 ? "y" : "ies"}`);
    noteParts.push(
      `couldn't identify a clear name for: ${parts.join(", ")} (add ${totalUnnamedSkipped === 1 ? "it" : "them"} manually, or edit the resume text and re-parse)`,
    );
  }
  if (totalDuplicateSkipped > 0) {
    const parts: string[] = [];
    if (duplicateExperienceCount > 0) parts.push(`${duplicateExperienceCount} experience entr${duplicateExperienceCount === 1 ? "y" : "ies"}`);
    if (duplicateSkillCount > 0) parts.push(`${duplicateSkillCount} skill${duplicateSkillCount === 1 ? "" : "s"}`);
    if (duplicateCertificationCount > 0) parts.push(`${duplicateCertificationCount} certification${duplicateCertificationCount === 1 ? "" : "s"}`);
    if (duplicateEducationCount > 0) parts.push(`${duplicateEducationCount} education entr${duplicateEducationCount === 1 ? "y" : "ies"}`);
    noteParts.push(`already in your Career DNA: ${parts.join(", ")}`);
  }

  if (noteParts.length > 0) {
    return {
      success: true,
      imported,
      warning: `Imported everything else, but ${noteParts.join("; ")}.`,
    };
  }

  return { success: true, imported };
}

export async function analyzeResumeQualityAction(resumeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: resume } = await supabase
    .from("master_resumes")
    .select("id, raw_text, parsed_content")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!resume?.raw_text) {
    return { error: "Resume text not available" };
  }

  let quality;
  try {
    quality = await analyzeResumeQuality(resume.raw_text);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to analyze resume quality" };
  }

  const parsedContent =
    (resume.parsed_content as Record<string, unknown> | null) ?? {};

  const { error: updateError } = await supabase
    .from("master_resumes")
    .update({
      parsed_content: { ...parsedContent, qualityScore: quality },
    })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    type: "resume_quality",
    model: currentModelLabel(),
    prompt_version: RESUME_QUALITY_PROMPT_VERSION,
    input_reference: { resumeId },
    output: quality,
  });

  revalidatePath("/resumes");
  return { success: true };
}

export async function setActiveResumeAction(resumeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("master_resumes")
    .update({ is_active: false })
    .eq("user_id", user.id);

  await supabase
    .from("master_resumes")
    .update({ is_active: true })
    .eq("id", resumeId)
    .eq("user_id", user.id);

  revalidatePath("/resumes");
}

export async function deleteResumeAction(resumeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: resume } = await supabase
    .from("master_resumes")
    .select("file_path")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (resume?.file_path) {
    await supabase.storage.from("resumes").remove([resume.file_path]);
  }

  await supabase.from("master_resumes").delete().eq("id", resumeId).eq("user_id", user.id);

  revalidatePath("/resumes");
}
