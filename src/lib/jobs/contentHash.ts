import { createHash } from "node:crypto";

/** Stable dedup key: normalized title+company+location, not the full raw text. */
export function computeJobContentHash(params: {
  title: string;
  company: string;
  location?: string | null;
}): string {
  const normalized = [params.title, params.company, params.location ?? ""]
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, " "))
    .join("|");
  return createHash("sha256").update(normalized).digest("hex");
}
