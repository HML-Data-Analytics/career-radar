"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { jobSources, type DiscoveredJob } from "@/lib/jobs/sources";
import { computeJobContentHash } from "@/lib/jobs/contentHash";
import { normalizeToDateOrNull } from "@/lib/dates";

export type DiscoverJobsResult = {
  sourceId: string;
  sourceName: string;
  jobs: (DiscoveredJob & { alreadySaved: boolean })[];
  error?: string;
};

export async function discoverJobsAction(
  query?: string,
): Promise<{ error: string } | { success: true; results: DiscoverJobsResult[] }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { data: prefs } = await supabase
    .from("career_preferences")
    .select("target_roles, target_titles, locations, remote_preference")
    .eq("user_id", user.id)
    .maybeSingle();

  const derivedQuery =
    query?.trim() ||
    [...(prefs?.target_titles ?? []), ...(prefs?.target_roles ?? [])][0] ||
    "";

  if (!derivedQuery) {
    return {
      error:
        "Enter a search term, or set target roles/titles in Preferences so a search can be suggested automatically.",
    };
  }

  const { data: existingHashesRaw } = await supabase
    .from("saved_jobs")
    .select("jobs(content_hash)")
    .eq("user_id", user.id);
  const existingHashes = existingHashesRaw as
    | Array<{ jobs: { content_hash: string } | { content_hash: string }[] | null }>
    | null;
  const savedHashSet = new Set(
    (existingHashes ?? [])
      .map((s) => (Array.isArray(s.jobs) ? s.jobs[0]?.content_hash : s.jobs?.content_hash))
      .filter((h): h is string => !!h),
  );

  const results = await Promise.all(
    jobSources.map(async (source): Promise<DiscoverJobsResult> => {
      try {
        const remotePreference =
          prefs?.remote_preference === "remote" ||
          prefs?.remote_preference === "hybrid" ||
          prefs?.remote_preference === "on_site" ||
          prefs?.remote_preference === "no_preference"
            ? prefs.remote_preference
            : undefined;

        const jobs = await source.search({
          query: derivedQuery,
          locations: prefs?.locations ?? undefined,
          remotePreference,
          limit: 20,
        });

        const annotated = jobs.map((job) => {
          const hash = computeJobContentHash({
            title: job.title,
            company: job.company,
            location: job.location,
          });
          return { ...job, alreadySaved: savedHashSet.has(hash) };
        });

        return { sourceId: source.id, sourceName: source.name, jobs: annotated };
      } catch (err) {
        return {
          sourceId: source.id,
          sourceName: source.name,
          jobs: [],
          error: err instanceof Error ? err.message : "Search failed",
        };
      }
    }),
  );

  return { success: true, results };
}

export async function addDiscoveredJobAction(
  sourceId: string,
  job: DiscoveredJob,
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();
  const admin = createAdminClient();

  const contentHash = computeJobContentHash({
    title: job.title,
    company: job.company,
    location: job.location,
  });

  const { data: existingJob } = await admin
    .from("jobs")
    .select("id")
    .eq("content_hash", contentHash)
    .maybeSingle();

  let jobId: string;

  if (existingJob) {
    jobId = existingJob.id;
  } else {
    const { data: source } = await admin
      .from("job_sources")
      .select("id")
      .eq("name", sourceId)
      .maybeSingle();

    const { data: inserted, error: insertError } = await admin
      .from("jobs")
      .insert({
        source_id: source?.id ?? null,
        source_job_id: job.sourceJobId,
        title: job.title,
        company: job.company,
        location: job.location,
        remote_type: job.remoteType,
        employment_type: job.employmentType,
        salary_min: job.salaryMin,
        salary_max: job.salaryMax,
        currency: job.currency,
        description: job.description,
        industry: job.category,
        job_url: job.jobUrl,
        application_url: job.applicationUrl,
        posted_date: normalizeToDateOrNull(job.postedDate),
        content_hash: contentHash,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return { error: insertError?.message ?? "Failed to save job" };
    }
    jobId = inserted.id;
  }

  const { error } = await supabase
    .from("saved_jobs")
    .upsert({ user_id: user.id, job_id: jobId }, { onConflict: "user_id,job_id" });

  if (error) return { error: error.message };

  return { success: true, jobId };
}
