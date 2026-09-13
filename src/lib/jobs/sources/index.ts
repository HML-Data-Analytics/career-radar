import { remotiveSource } from "./remotive";
import { jsearchSource } from "./jsearch";
import type { JobSource } from "./types";

/**
 * Every registered job source. Add a new source by implementing JobSource
 * and listing it here - nothing else needs to change (search UI, dedup,
 * and storage are all source-agnostic already).
 */
export const jobSources: JobSource[] = [remotiveSource, jsearchSource];

export type { JobSource, JobSearchCriteria, DiscoveredJob } from "./types";
