"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { careerProfileSchema } from "@/lib/validations/careerProfile";

export type FormActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function upsertCareerProfileAction(
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

  const parsed = careerProfileSchema.safeParse({
    headline: formData.get("headline") || undefined,
    professionalSummary: formData.get("professionalSummary") || undefined,
    yearsOfExperience: formData.get("yearsOfExperience") || undefined,
    currentTitle: formData.get("currentTitle") || undefined,
    currentCompany: formData.get("currentCompany") || undefined,
    currentLocation: formData.get("currentLocation") || undefined,
    careerLevel: formData.get("careerLevel") || undefined,
    careerDirection: formData.get("careerDirection") || undefined,
    careerAmbition: formData.get("careerAmbition") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase.from("career_profiles").upsert(
    {
      user_id: user.id,
      headline: parsed.data.headline,
      professional_summary: parsed.data.professionalSummary,
      years_of_experience: parsed.data.yearsOfExperience,
      current_title: parsed.data.currentTitle,
      current_company: parsed.data.currentCompany,
      current_location: parsed.data.currentLocation,
      career_level: parsed.data.careerLevel,
      career_direction: parsed.data.careerDirection,
      career_ambition: parsed.data.careerAmbition,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/career-profile");
  revalidatePath("/dashboard");
  return { success: true };
}
