import { z } from "zod";

export const recommendationEnum = z.enum([
  "STRONGLY_RECOMMEND",
  "RECOMMEND",
  "CONSIDER",
  "WEAK_MATCH",
  "NOT_RECOMMENDED",
]);

export const careerProgressionEnum = z.enum([
  "promotion",
  "lateral_move",
  "strategic_pivot",
  "downgrade",
  "temporary_step",
  "unclear",
]);

export const jobMatchDimensionScoresSchema = z.object({
  seniority: z.number().min(0).max(100),
  functional: z.number().min(0).max(100),
  technical: z.number().min(0).max(100),
  leadership: z.number().min(0).max(100),
  industry: z.number().min(0).max(100),
  geography: z.number().min(0).max(100),
  careerProgression: z.number().min(0).max(100),
});

export const jobMatchResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  qualificationScore: z.number().min(0).max(100),
  careerFitScore: z.number().min(0).max(100),
  opportunityQualityScore: z.number().min(0).max(100),
  scores: jobMatchDimensionScoresSchema,
  careerProgression: careerProgressionEnum,
  recommendation: recommendationEnum,
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  transferableExperience: z.array(z.string()),
  reasoning: z.string(),
  shouldApply: z.boolean(),
  shouldApplyReasons: z.array(z.string()),
});

export type JobMatchResult = z.infer<typeof jobMatchResultSchema>;
