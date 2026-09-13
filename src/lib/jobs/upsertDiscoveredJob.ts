import { createAdminClient } from "@/lib/supabase/admin";
import { computeJobContentHash } from "@/lib/jobs/contentHash";
import { normalizeToDateOrNull } from "@/lib/dates";
import type { DiscoveredJob } from "@/lib/jobs/sources";

/**
 * Inserts a discovered job if it doesn't already exist (by content hash),
 * or returns the existing row's id. Shared by the daily refresh cron and
 * any on-demand discovery path so there's one place that defines how a
 * DiscoveredJob maps onto the `jobs` table.
 */
export async function upsertDiscoveredJob(
  sourceId: string,
  job: DiscoveredJob,
  createdBy: string | null,
): Promise<{ jobId: string } | { error: string }> {
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

  if (existingJob) {
    return { jobId: existingJob.id };
  }

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
      created_by: createdBy,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: insertError?.message ?? "Failed to save job" };
  }

  return { jobId: inserted.id };
}
