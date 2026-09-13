import { z } from "zod";

export const tailoringIntensityEnum = z.enum(["conservative", "balanced", "aggressive"]);
export type TailoringIntensity = z.infer<typeof tailoringIntensityEnum>;

export const tailoredResumeContentSchema = z.object({
  headline: z.string(),
  professionalSummary: z.string(),
  skills: z.array(z.string()).describe("Reordered/selected skills, most relevant to this job first"),
  experiences: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      location: z.string().nullable(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      isCurrent: z.boolean(),
      bullets: z.array(z.string()).describe("Reworded/reordered bullet points for this role"),
    }),
  ),
});

export type TailoredResumeContent = z.infer<typeof tailoredResumeContentSchema>;

export const resumeTailorResultSchema = z.object({
  content: tailoredResumeContentSchema,
  changesSummary: z.array(
    z.object({
      type: z.enum(["added", "removed", "reworded", "reordered"]),
      description: z.string(),
    }),
  ),
  potentialConcerns: z.array(z.string()),
  unsupportedRequirementsNotAdded: z.array(
    z.object({
      requirement: z.string(),
      reason: z.string(),
    }),
  ),
});

export type ResumeTailorResult = z.infer<typeof resumeTailorResultSchema>;
