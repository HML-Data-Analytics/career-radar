/**
 * Normalizes a loosely-formatted date string (as AI parsers commonly
 * produce - "2023-12", "2023", "Dec 2023") into a valid Postgres `date`
 * literal ("YYYY-MM-DD"), or null if it can't be confidently parsed.
 * Postgres `date` columns reject anything less precise than a full date,
 * so a bare year-month from an AI response fails the insert outright
 * unless normalized first.
 */
export function normalizeToDateOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}
