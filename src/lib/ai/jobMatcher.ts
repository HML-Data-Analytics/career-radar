import { getOpenAI } from "@/lib/ai/openai";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import { jobMatchResultSchema, type JobMatchResult } from "@/lib/validations/jobMatch";
import { zodTextFormat } from "openai/helpers/zod";

const SYSTEM_PROMPT = `You are a career strategy analyst. You compare a candidate's verified career profile against a job description and produce a structured, honest assessment.

Rules:
- Base every score and claim ONLY on the candidate data provided. Do not assume skills, experience, or achievements that are not stated.
- Distinguish "can the candidate do this job" (qualification) from "does this align with their career direction" (career fit) from "is this actually a good opportunity" (opportunity quality). A high qualification score does NOT imply the candidate should apply.
- List gaps honestly, including gaps that have no verified evidence.
- Career progression should reflect whether this role is a promotion, lateral move, strategic pivot, downgrade, temporary step, or unclear relative to the candidate's current level and stated career direction.
- shouldApply should be false when career fit or opportunity quality is weak even if qualification is high, and shouldApplyReasons should explain why in plain language (e.g. "too junior", "poor career progression", "salary mismatch").`;

export async function analyzeJobMatch(input: {
  careerProfile: unknown;
  experiences: unknown;
  skills: unknown;
  evidence: unknown;
  preferences: unknown;
  job: unknown;
}): Promise<JobMatchResult> {
  const client = getOpenAI();

  const response = await client.responses.parse({
    model: DEFAULT_MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify(input, null, 2),
      },
    ],
    text: {
      format: zodTextFormat(jobMatchResultSchema, "job_match_result"),
    },
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("Job matcher returned no structured output");
  }

  return jobMatchResultSchema.parse(parsed);
}
