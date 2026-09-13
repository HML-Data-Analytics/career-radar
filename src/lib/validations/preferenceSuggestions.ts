import { z } from "zod";

export const preferenceSuggestionsSchema = z.object({
  targetRoles: z.array(z.string()).describe("Functional roles that match the candidate's demonstrated experience"),
  targetTitles: z.array(z.string()).describe("Specific job titles matching their level and trajectory"),
  seniority: z.array(z.string()).describe("Seniority levels consistent with their most recent roles"),
  industries: z.array(z.string()).describe("Industries they have real experience in"),
  locations: z.array(z.string()).describe("Locations based on their current/past locations - empty if unclear"),
  preferredTechnologies: z.array(z.string()).describe("Skills/technologies from their verified skill list worth prioritizing"),
  reasoning: z.string().describe("One or two sentences explaining the basis for these suggestions"),
});

export type PreferenceSuggestions = z.infer<typeof preferenceSuggestionsSchema>;
