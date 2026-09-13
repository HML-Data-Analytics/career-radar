import { askStructured } from "@/lib/ai/genaiClient";
import { RESUME_PARSER_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { parsedResumeSchema, type ParsedResume } from "@/lib/validations/resumeParse";

const SYSTEM_PROMPT = `You extract structured career data from a resume's raw text. Only use information present in the text - never invent employers, titles, dates, achievements, or metrics that aren't stated. If a field isn't present, use null or an empty array. Preserve the resume's own wording for achievements and responsibilities rather than paraphrasing.

For each work experience entry, company and title are especially important: read the surrounding lines carefully (job title and employer are very often on the same line or the line directly above/below each other, sometimes separated by "at", "@", a comma, a pipe, or on separate lines with unusual formatting). Only leave company or title null if the entry genuinely does not state an employer or role anywhere near it - do not leave them null just because the formatting is inconsistent or unusual.`;

export async function parseResumeText(rawText: string): Promise<ParsedResume> {
  return askStructured({
    systemPrompt: SYSTEM_PROMPT,
    userContent: rawText,
    schema: parsedResumeSchema,
  });
}

export { RESUME_PARSER_PROMPT_VERSION };
