const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split("-").map(Number);
  if (!year) return dateStr;
  if (!month) return String(year);
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

function monthsBetween(start: string, end: Date): number {
  const [sy, sm] = start.split("-").map(Number);
  const startDate = new Date(sy, (sm || 1) - 1);
  return (
    (end.getFullYear() - startDate.getFullYear()) * 12 +
    (end.getMonth() - startDate.getMonth()) +
    1
  );
}

function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years === 1 ? "" : "s"}`);
  if (remMonths > 0 || years === 0) parts.push(`${remMonths} mo${remMonths === 1 ? "" : "s"}`);
  return parts.join(" ");
}

/** LinkedIn-style "Jan 2023 - Present · 1 yr 2 mos" date range label. */
export function formatExperienceDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean,
): string | null {
  if (!startDate) return null;

  const startLabel = formatMonthYear(startDate);
  const endLabel = isCurrent ? "Present" : endDate ? formatMonthYear(endDate) : null;
  const endForDuration = isCurrent ? new Date() : endDate ? new Date(endDate) : null;

  const range = endLabel ? `${startLabel} - ${endLabel}` : startLabel;
  if (!endForDuration) return range;

  const months = monthsBetween(startDate, endForDuration);
  if (months < 1) return range;

  return `${range} · ${formatDuration(months)}`;
}
