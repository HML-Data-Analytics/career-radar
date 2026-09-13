import { askStructured } from "@/lib/ai/genaiClient";
import { INTERVIEW_PREP_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import {
  interviewPrepResultSchema,
  type InterviewPrepResult,
} from "@/lib/validations/interviewPrep";

const SYSTEM_PROMPT = `You prepare a candidate for an interview for a specific job, using ONLY their verified career profile, experience, skills, and verified evidence. Never invent employers, titles, dates, skills, achievements, or metrics.

Generate realistic interview questions across categories (general/likely, technical, leadership, behavioral, company-specific, and questions tied directly to this job description), each with a brief suggested approach grounded in the candidate's real background - not generic interview advice. Recommend specific stories from the candidate's verified evidence/experience that would work well for behavioral questions, noting which question types each story fits. List honest potential concerns an interviewer might probe (real gaps between the job's requirements and the candidate's shown experience) so the candidate can prepare for them rather than be caught off guard.`;

export async function generateInterviewPrep(input: {
  careerProfile: unknown;
  experiences: unknown;
  skills: unknown;
  evidence: unknown;
  job: unknown;
}): Promise<InterviewPrepResult> {
  return askStructured({
    systemPrompt: SYSTEM_PROMPT,
    userContent: JSON.stringify(input, null, 2),
    schema: interviewPrepResultSchema,
  });
}

export { INTERVIEW_PREP_PROMPT_VERSION };
