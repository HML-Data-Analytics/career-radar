import { askStructured } from "@/lib/ai/genaiClient";
import { APPLICATION_PACKAGE_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import {
  applicationPackageResultSchema,
  type ApplicationPackageResult,
} from "@/lib/validations/applicationPackage";

const SYSTEM_PROMPT = `You prepare application materials (cover letter, elevator pitch, positioning) for a candidate applying to a specific job. Use ONLY the candidate's verified career profile, experience, skills, and verified evidence provided - never invent employers, titles, dates, skills, achievements, or metrics that aren't in the provided data.

The cover letter and talking points should be specific and grounded in real experience, not generic. Identify potential weaknesses honestly (gaps between what the job wants and what the candidate has shown) along with how to address them in conversation - do not hide or paper over real gaps, but don't be alarmist either.`;

export async function generateApplicationPackage(input: {
  careerProfile: unknown;
  experiences: unknown;
  skills: unknown;
  evidence: unknown;
  job: unknown;
}): Promise<ApplicationPackageResult> {
  return askStructured({
    systemPrompt: SYSTEM_PROMPT,
    userContent: JSON.stringify(input, null, 2),
    schema: applicationPackageResultSchema,
  });
}

export { APPLICATION_PACKAGE_PROMPT_VERSION };
