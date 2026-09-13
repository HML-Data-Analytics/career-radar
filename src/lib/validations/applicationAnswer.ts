import { z } from "zod";

export const applicationAnswerResultSchema = z.object({
  answer: z.string(),
  usedEvidence: z
    .array(z.string())
    .describe("Short references to which verified experiences/evidence the answer draws on"),
  gapsNote: z
    .string()
    .nullable()
    .describe("If the question asks for something with no verified evidence, explain honestly rather than fabricating"),
});

export type ApplicationAnswerResult = z.infer<typeof applicationAnswerResultSchema>;
