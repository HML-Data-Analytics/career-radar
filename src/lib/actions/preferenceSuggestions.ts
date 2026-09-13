"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { generatePreferenceSuggestions } from "@/lib/ai/preferenceSuggestions";
import { PREFERENCE_SUGGESTIONS_PROMPT_VERSION } from "@/lib/ai/preferenceSuggestions";
import { currentModelLabel } from "@/lib/ai/models";
import type { PreferenceSuggestions } from "@/lib/validations/preferenceSuggestions";

export async function generatePreferenceSuggestionsAction(): Promise<
  { error: string } | { success: true; suggestions: PreferenceSuggestions }
> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();

  const [{ data: careerProfile }, { data: experiences }, { data: skills }] =
    await Promise.all([
      supabase.from("career_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("career_experiences").select("*").eq("user_id", user.id),
      supabase.from("career_skills").select("*").eq("user_id", user.id),
    ]);

  if (!careerProfile) {
    return { error: "Complete your Career Profile first so suggestions have something to work from." };
  }

  let result: PreferenceSuggestions;
  try {
    result = await generatePreferenceSuggestions({
      careerProfile,
      experiences: experiences ?? [],
      skills: skills ?? [],
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate suggestions" };
  }

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    type: "preference_suggestions",
    model: currentModelLabel(),
    prompt_version: PREFERENCE_SUGGESTIONS_PROMPT_VERSION,
    input_reference: {},
    output: result,
  });

  return { success: true, suggestions: result };
}

/** Merges the given suggested values into existing preferences, additive
 * (union), never removing anything the user already has set. */
export async function applyPreferenceSuggestionsAction(
  suggestions: Pick<
    PreferenceSuggestions,
    "targetRoles" | "targetTitles" | "seniority" | "industries" | "locations" | "preferredTechnologies"
  >,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("career_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  function mergeUnique(current: string[] | null | undefined, incoming: string[]): string[] {
    const set = new Set([...(current ?? []), ...incoming]);
    return Array.from(set);
  }

  const { error } = await supabase.from("career_preferences").upsert(
    {
      user_id: user.id,
      target_roles: mergeUnique(existing?.target_roles, suggestions.targetRoles),
      target_titles: mergeUnique(existing?.target_titles, suggestions.targetTitles),
      seniority: mergeUnique(existing?.seniority, suggestions.seniority),
      industries: mergeUnique(existing?.industries, suggestions.industries),
      locations: mergeUnique(existing?.locations, suggestions.locations),
      preferred_technologies: mergeUnique(
        existing?.preferred_technologies,
        suggestions.preferredTechnologies,
      ),
    },
    { onConflict: "user_id" },
  );

  if (error) return { error: error.message };

  revalidatePath("/preferences");
  revalidatePath("/dashboard");
  return { success: true };
}
