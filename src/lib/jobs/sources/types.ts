/**
 * Pluggable job source contract (product spec section 27). Each source
 * wraps one external, approved job feed/API - never a scrape of a site
 * whose terms prohibit it (LinkedIn included; see README's Job Sources
 * section for why that's off the table entirely, not just unbuilt).
 */

export type JobSearchCriteria = {
  /** Free-text query - role/title keywords. */
  query?: string;
  locations?: string[];
  remotePreference?: "remote" | "hybrid" | "on_site" | "no_preference";
  industries?: string[];
  /** Max results to return from this source for one search. */
  limit?: number;
};

export type DiscoveredJob = {
  /** Stable id within this source, used for dedup alongside content_hash. */
  sourceJobId: string;
  title: string;
  company: string;
  location: string | null;
  remoteType: "remote" | "hybrid" | "on_site" | "unknown";
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  description: string;
  category: string | null;
  jobUrl: string;
  applicationUrl: string | null;
  postedDate: string | null;
};

export interface JobSource {
  id: string;
  name: string;
  search(criteria: JobSearchCriteria): Promise<DiscoveredJob[]>;
}
