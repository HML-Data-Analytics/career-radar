import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jobSources } from "@/lib/jobs/sources";
import { upsertDiscoveredJob } from "@/lib/jobs/upsertDiscoveredJob";

export const maxDuration = 60;

const EXPIRY_DAYS = 30;

/**
 * Daily site-wide job refresh (see vercel.json for the schedule). Pulls
 * from every registered JobSource once, upserts into `jobs` (shared,
 * deduplicated - not tied to any one user), then deletes jobs that are
 * past the expiry window AND that nobody has saved or applied to, so the
 * table doesn't grow unbounded with stale listings.
 *
 * This replaces per-user, on-demand discovery calls: with this cron in
 * place, users browse/filter jobs already sitting in the DB instead of
 * each triggering their own search - far friendlier to a source like
 * Remotive whose terms ask for a handful of requests per day, not per user.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const summary: Record<string, { fetched: number; upserted: number; errors: string[] }> = {};

  for (const source of jobSources) {
    const errors: string[] = [];
    let upserted = 0;
    let fetched = 0;

    try {
      const jobs = await source.search({ limit: 50 });
      fetched = jobs.length;

      for (const job of jobs) {
        const result = await upsertDiscoveredJob(source.id, job, null);
        if ("error" in result) {
          errors.push(`${job.title} @ ${job.company}: ${result.error}`);
        } else {
          upserted++;
        }
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Source search failed");
    }

    summary[source.id] = { fetched, upserted, errors };
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS);

  const { data: staleJobs } = await admin
    .from("jobs")
    .select("id, saved_jobs(id), applications(id)")
    .lt("discovered_date", cutoff.toISOString());

  const staleIds = (staleJobs ?? [])
    .filter((j) => {
      const saved = Array.isArray(j.saved_jobs) ? j.saved_jobs : j.saved_jobs ? [j.saved_jobs] : [];
      const applied = Array.isArray(j.applications) ? j.applications : j.applications ? [j.applications] : [];
      return saved.length === 0 && applied.length === 0;
    })
    .map((j) => j.id);

  let deleted = 0;
  if (staleIds.length > 0) {
    const { error: deleteError, count } = await admin
      .from("jobs")
      .delete({ count: "exact" })
      .in("id", staleIds);
    if (!deleteError) deleted = count ?? 0;
  }

  return NextResponse.json({ ok: true, sources: summary, deletedStaleJobs: deleted });
}
