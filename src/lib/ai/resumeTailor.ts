import { askStructured } from "@/lib/ai/genaiClient";
import { RESUME_TAILOR_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import {
  resumeTailorResultSchema,
  type ResumeTailorResult,
  type TailoringIntensity,
} from "@/lib/validations/resumeTailor";

const INTENSITY_GUIDANCE: Record<TailoringIntensity, string> = {
  conservative:
    "Conservative: make minimal wording changes. Preserve the candidate's original phrasing, structure, and voice almost entirely. Only reorder skills/bullets when clearly relevant to this job.",
  balanced:
    "Balanced: align strongly with the job while preserving the candidate's original voice. Reword bullets for clarity and relevance, reorder skills and experience emphasis, but don't restructure wholesale.",
  aggressive:
    "Aggressive: restructure and optimize more freely for keyword alignment and positioning, while remaining completely truthful. You may significantly reword bullets and reorder content, but never invent content.",
};

const SYSTEM_PROMPT = `You tailor a candidate's resume to a specific job description. This is the single most important rule: you may NEVER invent employers, titles, dates, qualifications, certifications, technologies, responsibilities, achievements, metrics, leadership scope, or business results. You may only work with what is in the candidate's verified Career DNA (career profile, experiences, skills, verified evidence) and their existing master resume content.

What you CAN do:
- Improve wording, structure, and positioning of existing true statements
- Reorder skills and experience bullets by relevance to this job
- Emphasize achievements/skills that are already true and relevant
- Rewrite the professional summary and headline using only real career facts
- Select which existing skills/bullets to surface first

What you MUST NOT do:
- Add a skill, technology, or qualification not present in the candidate's verified data, even if the job requires it
- Add metrics, numbers, or scope that aren't in the source data
- Change employer names, titles, or dates
- Claim experience the candidate doesn't have

For any job requirement that has no verified evidence to support it, list it in unsupportedRequirementsNotAdded with a plain-language reason (e.g. "No verified evidence of Snowflake experience") instead of adding it to the resume.

List every meaningful change you made in changesSummary, and list potentialConcerns for anything a reviewer should double check before approving.`;

export async function tailorResume(input: {
  intensity: TailoringIntensity;
  careerProfile: unknown;
  experiences: unknown;
  skills: unknown;
  evidence: unknown;
  masterResumeText: string;
  job: unknown;
}): Promise<ResumeTailorResult> {
  const systemPrompt = `${SYSTEM_PROMPT}\n\nTailoring intensity for this request: ${INTENSITY_GUIDANCE[input.intensity]}`;

  return askStructured({
    systemPrompt,
    userContent: JSON.stringify(
      {
        careerProfile: input.careerProfile,
        experiences: input.experiences,
        skills: input.skills,
        verifiedEvidence: input.evidence,
        masterResumeText: input.masterResumeText,
        job: input.job,
      },
      null,
      2,
    ),
    schema: resumeTailorResultSchema,
  });
}

export { RESUME_TAILOR_PROMPT_VERSION };
