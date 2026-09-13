import { z } from "zod";

export const jdIntelligenceSchema = z.object({
  explicitRequirements: z.array(
    z.object({
      requirement: z.string(),
      category: z
        .enum(["skill", "experience", "education", "certification", "other"])
        .catch("other"),
      required: z.boolean(),
    }),
  ),
  inferredPriorities: z.array(
    z.object({
      priority: z.string(),
      weight: z.enum(["HIGH", "MEDIUM", "LOW"]).catch("MEDIUM"),
      rationale: z.string(),
    }),
  ),
  hiddenSignals: z.array(z.string()),
  roleInterpretation: z.string(),
});

export type JdIntelligence = z.infer<typeof jdIntelligenceSchema>;

export const redFlagSchema = z.object({
  flags: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high"]).catch("medium"),
    }),
  ),
});

export type RedFlagResult = z.infer<typeof redFlagSchema>;
