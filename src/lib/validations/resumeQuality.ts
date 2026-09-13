import { z } from "zod";

export const resumeQualityScoreSchema = z.object({
  atsCompatibility: z.number().min(0).max(100),
  impact: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  keywordCoverage: z.number().min(0).max(100),
  leadershipPositioning: z.number().min(0).max(100),
  quantification: z.number().min(0).max(100),
  readability: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
});

export type ResumeQualityScore = z.infer<typeof resumeQualityScoreSchema>;
