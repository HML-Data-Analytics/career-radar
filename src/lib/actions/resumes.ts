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
          company: string;
          title: string;
          location: string | null;
          startDate: string | null;
          endDate: string | null;
          isCurrent: boolean;
          description: string | null;
          responsibilities: string[];
          achievements: string[];
        }>;
        skills: Array<{ skill: string; category: string | null }>;
        certifications: Array<{ name: string; issuer: string | null; issueDate: string | null }>;
        education: Array<{
          institution: string;
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

  await supabase.from("career_profiles").upsert(
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

  if (parsed.experiences.length > 0) {
    await supabase.from("career_experiences").insert(
      parsed.experiences.map((exp) => ({
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
  }

  if (parsed.skills.length > 0) {
    await supabase.from("career_skills").insert(
      parsed.skills.map((s) => ({
        user_id: user.id,
        skill: s.skill,
        category: s.category,
      })),
    );
  }

  if (parsed.certifications.length > 0) {
    await supabase.from("career_certifications").insert(
      parsed.certifications.map((c) => ({
        user_id: user.id,
        name: c.name,
        issuer: c.issuer,
        issue_date: c.issueDate,
      })),
    );
  }

  if (parsed.education.length > 0) {
    await supabase.from("career_education").insert(
      parsed.education.map((e) => ({
        user_id: user.id,
        institution: e.institution,
        degree: e.degree,
        field: e.field,
        start_date: e.startDate,
        end_date: e.endDate,
      })),
    );
  }

  revalidatePath("/career-dna");
  revalidatePath("/career-profile");
  revalidatePath("/resumes");
  return { success: true };
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
