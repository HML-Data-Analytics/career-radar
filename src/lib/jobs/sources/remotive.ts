import type { JobSource, JobSearchCriteria, DiscoveredJob } from "./types";

/**
 * Remotive's public jobs API (https://remotive.com/api-documentation).
 * Remote jobs only - that's the scope of this source, not a limitation of
 * the search UI.
 *
 * IMPORTANT: verified against the live endpoint (2026-09) that the free
 * tier does NOT honor `search`, `category`, or `limit` query params
 * server-side - it returns the same small fixed pool of recent postings
 * regardless of query. Remotive's docs mention a separate paid API
 * ($5k/mo, contact hello@remotive.io) for real filtering; this free tier
 * appears to be a fixed sample/snapshot rather than a search API. So
 * `search` and `limit` are still passed (harmless, and correct if Remotive
 * ever does honor them), but this adapter also filters and truncates
 * client-side against whatever comes back, so a search query still
 * meaningfully narrows what the user sees.
 *
 * Remotive's API terms require: link back to the job's Remotive URL and
 * credit Remotive as the source wherever a listing is shown, and don't
 * over-poll (they ask for at most ~4 requests/day site-wide, not per
 * user). Every DiscoveredJob from this source keeps its real remotive.com
 * URL as jobUrl so that requirement is satisfied wherever jobUrl is
 * rendered with attribution.
 */
const REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs";

type RemotiveApiJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
};

/**
 * Remotive's `salary` field is free text written by each job poster (e.g.
 * "$100k - $130k", "$31,2k- $52k" - a real example with a stray comma
 * inside the number, likely a typo for "31.2k"). Parsing free text like
 * this can never be fully reliable, so this only strips commas that look
 * like a genuine thousands separator (digit groups of exactly 3, e.g.
 * "31,200") - a comma splitting a 1-2 digit group next to "k" (like
 * "31,2k") is left alone and that number is dropped rather than guessed,
 * since a wrong salary shown to the user is worse than no salary shown.
 */
function parseSalaryRange(salary: string): { min: number | null; max: number | null } {
  // A comma immediately before 1-2 digits then "k" (e.g. "31,2k") is an
  // unrecoverable malformed number - likely a decimal comma typo for
  // "31.2k" - not a thousands separator. Drop that whole fragment rather
  // than guess, since a wrong salary shown to the user is worse than none.
  const withAmbiguousFragmentsRemoved = salary.replace(/\d,\d{1,2}k/gi, "");
  const withThousandsSeparatorsRemoved = withAmbiguousFragmentsRemoved.replace(
    /(\d),(\d{3})(?!\d)/g,
    "$1$2",
  );

  const numbers = withThousandsSeparatorsRemoved
    .match(/\d+(?:\.\d+)?k?/gi)
    ?.map((s) => {
      const isK = /k$/i.test(s);
      const n = parseFloat(s.replace(/k$/i, ""));
      return isK ? n * 1000 : n;
    })
    // A parsed value under 1000 is more likely leftover noise from a
    // malformed source string than a real annual salary figure.
    .filter((n) => Number.isFinite(n) && n >= 1000);

  if (!numbers || numbers.length === 0) return { min: null, max: null };
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function toDiscoveredJob(job: RemotiveApiJob): DiscoveredJob {
  const { min, max } = parseSalaryRange(job.salary ?? "");
  return {
    sourceJobId: String(job.id),
    title: job.title,
    company: job.company_name.trim(),
    location: job.candidate_required_location || "Remote",
    remoteType: "remote",
    employmentType: job.job_type || null,
    salaryMin: min,
    salaryMax: max,
    currency: min || max ? "USD" : null,
    description: stripHtml(job.description).slice(0, 8000),
    category: job.category || null,
    jobUrl: job.url,
    applicationUrl: job.url,
    postedDate: job.publication_date ? job.publication_date.slice(0, 10) : null,
  };
}

export const remotiveSource: JobSource = {
  id: "remotive",
  name: "Remotive",
  async search(criteria: JobSearchCriteria): Promise<DiscoveredJob[]> {
    const params = new URLSearchParams();
    if (criteria.query) params.set("search", criteria.query);
    if (criteria.limit) params.set("limit", String(criteria.limit));

    const url = `${REMOTIVE_API_URL}?${params.toString()}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "CareerRadar/1.0 (+https://career-radar.app)" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Remotive API returned ${response.status}`);
    }

    const data = (await response.json()) as { jobs: RemotiveApiJob[] };
    let jobs = (data.jobs ?? []).map(toDiscoveredJob);

    // Remotive is remote-only. If the user's preference is explicitly for
    // on-site/hybrid work, this source has nothing relevant to offer.
    if (
      criteria.remotePreference === "on_site" ||
      criteria.remotePreference === "hybrid"
    ) {
      return [];
    }

    // The API's `search` param doesn't actually filter server-side (see
    // note above) - match client-side against title/company/category so
    // a query still narrows the small fixed pool the endpoint returns.
    if (criteria.query) {
      const q = criteria.query.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          (j.category ?? "").toLowerCase().includes(q),
      );
    }

    if (criteria.locations && criteria.locations.length > 0) {
      const wanted = criteria.locations.map((l) => l.toLowerCase());
      jobs = jobs.filter((j) => {
        const loc = (j.location ?? "").toLowerCase();
        return (
          loc.includes("worldwide") ||
          loc.includes("anywhere") ||
          wanted.some((w) => loc.includes(w))
        );
      });
    }

    if (criteria.limit) {
      jobs = jobs.slice(0, criteria.limit);
    }

    return jobs;
  },
};
