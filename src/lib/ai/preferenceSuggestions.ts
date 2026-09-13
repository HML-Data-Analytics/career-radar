import { askStructured } from "@/lib/ai/genaiClient";
import {
  preferenceSuggestionsSchema,
  type PreferenceSuggestions,
} from "@/lib/validations/preferenceSuggestions";

export const PREFERENCE_SUGGESTIONS_PROMPT_VERSION = "1.0.0";

const SYSTEM_PROMPT = `You suggest job search preferences for a candidate based ONLY on their actual career profile, experience, and skills provided - never invent industries, technologies, or seniority levels not evidenced in the data. These are starting-point suggestions the candidate will review and edit, not final settings, so favor a reasonably broad but relevant set over an overly narrow one. Leave a field as an empty array if you can't confidently infer it from the data (e.g. leave locations empty if no location is stated).`;

export async function generatePreferenceSuggestions(input: {
  careerProfile: unknown;
  experiences: unknown;
  skills: unknown;
}): Promise<PreferenceSuggestions> {
  return askStructured({
    systemPrompt: SYSTEM_PROMPT,
    userContent: JSON.stringify(input, null, 2),
    schema: preferenceSuggestionsSchema,
  });
}
