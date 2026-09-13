import OpenAI from "openai";

let client: OpenAI | null = null;

/** Lazily-constructed server-only OpenAI client. Never import from client code. */
export function getOpenAI() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
