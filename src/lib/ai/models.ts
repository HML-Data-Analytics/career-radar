/**
 * The model/deployment id actually in use, for AI-audit logging
 * (`ai_generations.model`). Resolved from GENAI_MODEL — the same env var
 * the GenAI Brewery client reads — so the audit trail reflects reality
 * instead of a hardcoded label that can drift out of sync.
 */
export function currentModelLabel(): string {
  return process.env.GENAI_MODEL ?? "unknown";
}
