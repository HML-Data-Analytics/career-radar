"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  careerExperienceSchema,
  careerSkillSchema,
  careerEvidenceSchema,
} from "@/lib/validations/careerProfile";
import type { FormActionState } from "@/lib/actions/careerProfile";

export async function addExperienceAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = careerExperienceSchema.safeParse({
    company: formData.get("company"),
    title: formData.get("title"),
    location: formData.get("location") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    isCurrent: formData.get("isCurrent") === "on",
    description: formData.get("description") || undefined,
    responsibilities: [],
    achievements: [],
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase.from("career_experiences").insert({
    user_id: user.id,
    company: parsed.data.company,
    title: parsed.data.title,
    location: parsed.data.location,
    start_date: parsed.data.startDate || null,
    end_date: parsed.data.isCurrent ? null : parsed.data.endDate || null,
    is_current: parsed.data.isCurrent,
    description: parsed.data.description,
  });

  if (error) return { error: error.message };

  revalidatePath("/career-dna");
  return { success: true };
}

export async function deleteExperienceAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("career_experiences").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/career-dna");
}

export async function addSkillAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = careerSkillSchema.safeParse({
    skill: formData.get("skill"),
    category: formData.get("category") || undefined,
    proficiency: formData.get("proficiency") || undefined,
    yearsExperience: formData.get("yearsExperience") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase.from("career_skills").insert({
    user_id: user.id,
    skill: parsed.data.skill,
    category: parsed.data.category,
    proficiency: parsed.data.proficiency,
    years_experience: parsed.data.yearsExperience,
  });

  if (error) return { error: error.message };

  revalidatePath("/career-dna");
  return { success: true };
}

export async function deleteSkillAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("career_skills").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/career-dna");
}

export async function addEvidenceAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const relatedSkillsRaw = formData.get("relatedSkills");
  const relatedSkills =
    typeof relatedSkillsRaw === "string"
      ? relatedSkillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const parsed = careerEvidenceSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    source: formData.get("source") || undefined,
    evidenceDate: formData.get("evidenceDate") || undefined,
    relatedSkills,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase.from("career_evidence").insert({
    user_id: user.id,
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    source: parsed.data.source,
    evidence_date: parsed.data.evidenceDate || null,
    related_skills: parsed.data.relatedSkills,
    verified: false,
  });

  if (error) return { error: error.message };

  revalidatePath("/career-dna");
  return { success: true };
}

export async function deleteEvidenceAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("career_evidence").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/career-dna");
}

export async function toggleEvidenceVerifiedAction(id: string, verified: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("career_evidence")
    .update({ verified })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/career-dna");
}

/**
 * Removes exact duplicate rows already sitting in Career DNA (e.g. from
 * importing the same resume more than once before dedup was added to the
 * import itself). Keeps the oldest row of each duplicate group so
 * verified/edited data isn't the thing that gets deleted, and never
 * touches career_evidence (deliberately user-curated, not resume-derived).
 */
export async function dedupeCareerDnaAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  function findDuplicateIds<T extends { id: string; created_at: string }>(
    rows: T[],
    keyOf: (row: T) => string,
  ): string[] {
    const sorted = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const seen = new Set<string>();
    const duplicateIds: string[] = [];
    for (const row of sorted) {
      const key = keyOf(row);
      if (seen.has(key)) {
        duplicateIds.push(row.id);
      } else {
        seen.add(key);
      }
    }
    return duplicateIds;
  }

  const [
    { data: experiences },
    { data: skills },
    { data: certifications },
    { data: education },
  ] = await Promise.all([
    supabase
      .from("career_experiences")
      .select("id, created_at, company, title, start_date")
      .eq("user_id", user.id),
    supabase.from("career_skills").select("id, created_at, skill").eq("user_id", user.id),
    supabase
      .from("career_certifications")
      .select("id, created_at, name")
      .eq("user_id", user.id),
    supabase
      .from("career_education")
      .select("id, created_at, institution, degree")
      .eq("user_id", user.id),
  ]);

  const duplicateIds = {
    career_experiences: findDuplicateIds(experiences ?? [], (e) =>
      [e.company, e.title, e.start_date ?? ""].join("|").toLowerCase().trim(),
    ),
    career_skills: findDuplicateIds(skills ?? [], (s) => s.skill.toLowerCase().trim()),
    career_certifications: findDuplicateIds(certifications ?? [], (c) =>
      c.name.toLowerCase().trim(),
    ),
    career_education: findDuplicateIds(education ?? [], (e) =>
      [e.institution, e.degree ?? ""].join("|").toLowerCase().trim(),
    ),
  };

  const totalDuplicates = Object.values(duplicateIds).reduce((sum, ids) => sum + ids.length, 0);
  if (totalDuplicates === 0) {
    return { success: true, removed: 0 };
  }

  const errors: string[] = [];
  for (const [table, ids] of Object.entries(duplicateIds) as [
    keyof typeof duplicateIds,
    string[],
  ][]) {
    if (ids.length === 0) continue;
    const { error } = await supabase.from(table).delete().in("id", ids);
    if (error) errors.push(error.message);
  }

  if (errors.length > 0) {
    return { error: errors.join(" | ") };
  }

  revalidatePath("/career-dna");
  return { success: true, removed: totalDuplicates };
}
