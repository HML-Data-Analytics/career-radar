import { getOpenAI } from "@/lib/ai/openai";
import { DEFAULT_MODEL } from "@/lib/ai/models";
import { JOB_PARSER_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { parsedJobSchema, type ParsedJob } from "@/lib/validations/jobParse";
import { zodTextFormat } from "openai/helpers/zod";

const SYSTEM_PROMPT = `You extract structured data from a job description. Only use information present in the text. Never invent salary, company details, or requirements that are not stated or clearly implied. If a field is not present, return null or an empty array.`;

export async function parseJobDescription(rawText: string): Promise<ParsedJob> {
  const client = getOpenAI();

  const response = await client.responses.parse({
    model: DEFAULT_MODEL,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: rawText },
    ],
    text: {
      format: zodTextFormat(parsedJobSchema, "parsed_job"),
    },
  });

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new Error("Job parser returned no structured output");
  }

  return parsedJobSchema.parse(parsed);
}

export { JOB_PARSER_PROMPT_VERSION };
