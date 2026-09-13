"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { careerPreferencesSchema } from "@/lib/validations/careerProfile";
import type { FormActionState } from "@/lib/actions/careerProfile";

function splitList(value: FormDataEntryValue | null): string[] {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function upsertCareerPreferencesAction(
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

  const remotePreference = formData.get("remotePreference");

  const parsed = careerPreferencesSchema.safeParse({
    targetRoles: splitList(formData.get("targetRoles")),
    targetTitles: splitList(formData.get("targetTitles")),
    seniority: splitList(formData.get("seniority")),
    industries: splitList(formData.get("industries")),
    locations: splitList(formData.get("locations")),
    remotePreference: remotePreference ? remotePreference : undefined,
    minSalary: formData.get("minSalary") || undefined,
    salaryCurrency: formData.get("salaryCurrency") || undefined,
    employmentType: splitList(formData.get("employmentType")),
    preferredCompanies: splitList(formData.get("preferredCompanies")),
    excludedCompanies: splitList(formData.get("excludedCompanies")),
    requiredTechnologies: splitList(formData.get("requiredTechnologies")),
    preferredTechnologies: splitList(formData.get("preferredTechnologies")),
    maxCommuteMinutes: formData.get("maxCommuteMinutes") || undefined,
    visaSponsorshipNeeded: formData.get("visaSponsorshipNeeded") === "on",
    openToRelocation: formData.get("openToRelocation") === "on",
    travelTolerance: formData.get("travelTolerance") || undefined,
    careerDirection: formData.get("careerDirection") || undefined,
    preferredCompanySize: splitList(formData.get("preferredCompanySize")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { error } = await supabase.from("career_preferences").upsert(
    {
      user_id: user.id,
      target_roles: parsed.data.targetRoles,
      target_titles: parsed.data.targetTitles,
      seniority: parsed.data.seniority,
      industries: parsed.data.industries,
      locations: parsed.data.locations,
      remote_preference: parsed.data.remotePreference,
      min_salary: parsed.data.minSalary,
      salary_currency: parsed.data.salaryCurrency,
      employment_type: parsed.data.employmentType,
      preferred_companies: parsed.data.preferredCompanies,
      excluded_companies: parsed.data.excludedCompanies,
      required_technologies: parsed.data.requiredTechnologies,
      preferred_technologies: parsed.data.preferredTechnologies,
      max_commute_minutes: parsed.data.maxCommuteMinutes,
      visa_sponsorship_needed: parsed.data.visaSponsorshipNeeded,
      open_to_relocation: parsed.data.openToRelocation,
      travel_tolerance: parsed.data.travelTolerance,
      career_direction: parsed.data.careerDirection,
      preferred_company_size: parsed.data.preferredCompanySize,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/preferences");
  return { success: true };
}
