import { z } from "zod";

export const applicationPackageResultSchema = z.object({
  coverLetter: z.string(),
  elevatorPitch: z.string().describe("A 30-second spoken introduction"),
  whyThisRole: z.string(),
  whyThisCompany: z.string(),
  keyTalkingPoints: z.array(z.string()),
  potentialWeaknesses: z.array(
    z.object({
      concern: z.string(),
      howToAddress: z.string(),
    }),
  ),
});

export type ApplicationPackageResult = z.infer<typeof applicationPackageResultSchema>;
