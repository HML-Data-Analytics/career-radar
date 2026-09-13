import { askStructured } from "@/lib/ai/genaiClient";
import { APPLICATION_ANSWER_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import {
  applicationAnswerResultSchema,
  type ApplicationAnswerResult,
} from "@/lib/validations/applicationAnswer";

const SYSTEM_PROMPT = `You draft an answer to a job application question, using ONLY the candidate's verified career profile, experience, skills, and verified evidence provided. Never invent employers, titles, dates, skills, achievements, or metrics that aren't in the provided data.

If the question asks about something the candidate has no verified evidence for, say so honestly in gapsNote rather than fabricating an answer - a partial, truthful answer is better than a confident but invented one. Keep the answer in the candidate's likely voice: professional but natural, not generic corporate filler.`;

export async function generateApplicationAnswer(input: {
  question: string;
  careerProfile: unknown;
  experiences: unknown;
  skills: unknown;
  evidence: unknown;
  job: unknown;
}): Promise<ApplicationAnswerResult> {
  return askStructured({
    systemPrompt: SYSTEM_PROMPT,
    userContent: JSON.stringify(input, null, 2),
    schema: applicationAnswerResultSchema,
  });
}

export { APPLICATION_ANSWER_PROMPT_VERSION };
