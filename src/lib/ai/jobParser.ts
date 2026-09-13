import { askStructured } from "@/lib/ai/genaiClient";
import { JOB_PARSER_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { parsedJobSchema, type ParsedJob } from "@/lib/validations/jobParse";

const SYSTEM_PROMPT = `You extract structured data from a job description. Only use information present in the text. Never invent salary, company details, or requirements that are not stated or clearly implied. If a field is not present, return null or an empty array.`;

export async function parseJobDescription(rawText: string): Promise<ParsedJob> {
  return askStructured({
    systemPrompt: SYSTEM_PROMPT,
    userContent: rawText,
    schema: parsedJobSchema,
  });
}

export { JOB_PARSER_PROMPT_VERSION };
