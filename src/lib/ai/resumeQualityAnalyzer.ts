import { askStructured } from "@/lib/ai/genaiClient";
import { RESUME_QUALITY_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import {
  resumeQualityScoreSchema,
  type ResumeQualityScore,
} from "@/lib/validations/resumeQuality";

const SYSTEM_PROMPT = `You are a resume quality analyst. Score the given resume text on these dimensions, each 0-100:
- atsCompatibility: how well a standard applicant tracking system would parse this (plain structure, standard section headers, no tables/columns/graphics implied by the text)
- impact: how much the bullet points convey outcomes/results rather than just duties
- clarity: how easy the writing is to read and understand quickly
- keywordCoverage: breadth of relevant skill/technology/role keywords present
- leadershipPositioning: how clearly scope, ownership, and leadership are conveyed where relevant
- quantification: how often achievements include concrete numbers/metrics
- readability: sentence structure, length, and overall prose quality
- overall: a holistic 0-100 score, not simply the average of the above

List concrete strengths and concerns as short, specific bullet points, not generic advice.`;

export async function analyzeResumeQuality(resumeText: string): Promise<ResumeQualityScore> {
  return askStructured({
    systemPrompt: SYSTEM_PROMPT,
    userContent: resumeText,
    schema: resumeQualityScoreSchema,
  });
}

export { RESUME_QUALITY_PROMPT_VERSION };
