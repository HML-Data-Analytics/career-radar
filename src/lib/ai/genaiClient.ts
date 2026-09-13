import { z } from "zod";

/**
 * Server-side client for Heineken's internal GenAI Brewery gateway
 * (genai.heineken.com). Internal-network only - calls will time out unless
 * the server making them is on the HML network or VPN. Never import from
 * client code; GENAI_API_KEY must stay server-side.
 */

const GENAI_URL = "https://genai.heineken.com/models/openai/v1/responses";
const TIMEOUT_MS = 60000;

type ResponsesContentPart = { type: "input_text"; text: string };
type ResponsesMessage = { role: "system" | "user"; content: ResponsesContentPart[] };

function text(role: ResponsesMessage["role"], value: string): ResponsesMessage {
  return { role, content: [{ type: "input_text", text: value }] };
}

async function callGenAI(input: ResponsesMessage[]): Promise<unknown> {
  const apiKey = process.env.GENAI_API_KEY;
  const model = process.env.GENAI_MODEL;

  if (!apiKey) throw new Error("GENAI_API_KEY is not configured on the server");
  if (!model) throw new Error("GENAI_MODEL is not configured on the server");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(GENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, input }),
      signal: ctrl.signal,
    });

    const raw = await upstream.text();
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    if (!upstream.ok) {
      const message =
        typeof data === "object" && data && "error" in data
          ? String((data as { error: unknown }).error)
          : `GenAI Brewery returned ${upstream.status}`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "GenAI Brewery did not respond in time - check the server is on the HML network or VPN",
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function extractOutputText(data: unknown): string {
  const d = data as {
    output?: Array<{ content?: Array<{ text?: string }> | string }>;
    choices?: Array<{ message?: { content?: string } }>;
  };

  const first = d.output?.[0]?.content;
  if (Array.isArray(first) && first[0]?.text) return first[0].text;
  if (typeof first === "string") return first;

  const chatContent = d.choices?.[0]?.message?.content;
  if (chatContent) return chatContent;

  throw new Error("GenAI Brewery response did not contain any output text");
}

/**
 * Asks GenAI Brewery for a response that must validate against `schema`,
 * by embedding the JSON Schema in the prompt and re-validating with Zod
 * (the gateway's Responses API implementation is not guaranteed to support
 * strict structured-output enforcement for every upstream model).
 */
export async function askStructured<T extends z.ZodType>(params: {
  systemPrompt: string;
  userContent: string;
  schema: T;
}): Promise<z.infer<T>> {
  const jsonSchema = z.toJSONSchema(params.schema);

  const systemPrompt = `${params.systemPrompt}

Respond with ONLY a single JSON object conforming exactly to this JSON Schema - no prose, no markdown code fences, no explanation:

${JSON.stringify(jsonSchema)}`;

  const data = await callGenAI([
    text("system", systemPrompt),
    text("user", params.userContent),
  ]);

  const outputText = extractOutputText(data);
  const jsonText = stripCodeFence(outputText);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    throw new Error("GenAI Brewery did not return valid JSON");
  }

  return params.schema.parse(parsedJson);
}

function stripCodeFence(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}
