import type { JobSource, JobSearchCriteria, DiscoveredJob } from "./types";

/**
 * JSearch (RapidAPI) - aggregates listings from LinkedIn, Indeed, Glassdoor,
 * ZipRecruiter and others via Google for Jobs' index. Requires a RapidAPI
 * key (`RAPIDAPI_KEY`) subscribed to the JSearch API.
 *
 * IMPORTANT: verified live (2026-09) that this API's `/search` endpoint
 * returns 404 "Endpoint does not exist" even with a valid, subscribed key -
 * the working endpoint on the current plan is `/search-v2`. Re-verify
 * against RapidAPI's dashboard for this app if this source starts failing;
 * RapidAPI has changed JSearch's endpoint shape before.
 *
 * Unlike Remotive, JSearch requires a non-empty `query` string to return
 * useful results and is metered (free tier: ~200 requests/month), so this
 * source does NOT support being called with no query the way Remotive does -
 * it falls back to a broad default query so the daily cron (which calls
 * every source with no query) still gets results without wasting quota on
 * multiple calls.
 */
const JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search-v2";
const JSEARCH_HOST = "jsearch.p.rapidapi.com";
const DEFAULT_QUERY = "jobs";

type JSearchApiJob = {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_location: string | null;
  job_city: string | null;
  job_country: string | null;
  job_is_remote: boolean;
  job_employment_type: string | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_description: string;
  job_apply_link: string | null;
  job_google_link: string | null;
  job_posted_at_datetime_utc: string | null;
};

function toDiscoveredJob(job: JSearchApiJob): DiscoveredJob {
  const location =
    job.job_location || [job.job_city, job.job_country].filter(Boolean).join(", ") || null;

  return {
    sourceJobId: job.job_id,
    title: job.job_title,
    company: job.employer_name,
    location: job.job_is_remote ? "Remote" : location,
    remoteType: job.job_is_remote ? "remote" : "unknown",
    employmentType: job.job_employment_type || null,
    salaryMin: job.job_min_salary ?? null,
    salaryMax: job.job_max_salary ?? null,
    currency: job.job_salary_currency ?? null,
    description: (job.job_description ?? "").slice(0, 8000),
    category: null,
    jobUrl: job.job_apply_link || job.job_google_link || "",
    applicationUrl: job.job_apply_link ?? null,
    postedDate: job.job_posted_at_datetime_utc
      ? job.job_posted_at_datetime_utc.slice(0, 10)
      : null,
  };
}

export const jsearchSource: JobSource = {
  id: "jsearch",
  name: "JSearch",
  async search(criteria: JobSearchCriteria): Promise<DiscoveredJob[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      throw new Error("RAPIDAPI_KEY is not set");
    }

    let query = criteria.query?.trim() || DEFAULT_QUERY;
    if (criteria.locations && criteria.locations.length > 0) {
      query = `${query} in ${criteria.locations[0]}`;
    }

    const params = new URLSearchParams({
      query,
      num_pages: "1",
      date_posted: "all",
    });
    if (criteria.remotePreference === "remote") {
      params.set("remote_jobs_only", "true");
    }

    const url = `${JSEARCH_API_URL}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": JSEARCH_HOST,
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      throw new Error(`JSearch API returned ${response.status}`);
    }

    const data = (await response.json()) as { data?: { jobs?: JSearchApiJob[] } };
    let jobs = (data.data?.jobs ?? [])
      .filter((j) => j.job_id && j.job_title && j.employer_name)
      .map(toDiscoveredJob);

    if (criteria.limit) {
      jobs = jobs.slice(0, criteria.limit);
    }

    return jobs;
  },
};
