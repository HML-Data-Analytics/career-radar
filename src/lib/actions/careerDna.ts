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
