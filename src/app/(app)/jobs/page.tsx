import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { JobPasteForm } from "@/components/jobs/job-paste-form";
import { DiscoveredJobsSection } from "@/components/jobs/discovered-jobs-section";
import { JobsList } from "@/components/jobs/jobs-list";
import { jobMatchesPreferences } from "@/lib/jobs/matchesPreferences";

export default async function JobsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const [{ data: savedJobsRaw }, { data: matches }, { data: prefs }, { data: recentJobsRaw }] =
    await Promise.all([
      supabase
        .from("saved_jobs")
        .select("id, created_at, jobs(id, title, company, location, seniority, industry, remote_type)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("job_matches")
        .select("job_id, overall_score, recommendation")
        .eq("user_id", user!.id),
      supabase
        .from("career_preferences")
        .select("target_roles, target_titles, locations, seniority, industries, remote_preference")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("jobs")
        .select(
          "id, title, company, location, seniority, industry, remote_type, job_url, job_sources(name)",
        )
        .order("discovered_date", { ascending: false })
        .limit(100),
    ]);

  const savedJobs = (savedJobsRaw ?? [])
    .map((saved) => {
      const job = Array.isArray(saved.jobs) ? saved.jobs[0] : saved.jobs;
      return job ? { id: saved.id, job } : null;
    })
    .filter((s): s is { id: string; job: NonNullable<typeof s>["job"] } => s !== null);

  const savedJobIds = new Set(savedJobs.map((s) => s.job.id));

  const matchByJobId = Object.fromEntries(
    (matches ?? []).map((m) => [m.job_id, m]),
  );

  const hasPreferences = !!(
    prefs &&
    ((prefs.locations && prefs.locations.length > 0) ||
      (prefs.seniority && prefs.seniority.length > 0) ||
      (prefs.industries && prefs.industries.length > 0) ||
      prefs.remote_preference)
  );

  const discoveredJobs = (recentJobsRaw ?? [])
    .filter((job) => !savedJobIds.has(job.id))
    .filter((job) => jobMatchesPreferences(job, prefs ?? null))
    .slice(0, 20)
    .map((job) => {
      const source = Array.isArray(job.job_sources) ? job.job_sources[0] : job.job_sources;
      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        job_url: job.job_url,
        source_name: source?.name ?? null,
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">
          Listings refresh automatically once a day from approved sources and are matched against your preferences. LinkedIn is not a source here - see the README for why.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {hasPreferences ? "Matching your preferences" : "Recently discovered"}
        </h2>
        <DiscoveredJobsSection jobs={discoveredJobs} />
      </div>

      <JobPasteForm />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Your jobs
        </h2>
        <JobsList
          savedJobs={savedJobs}
          matchByJobId={matchByJobId}
          prefs={prefs ?? null}
          hasPreferences={hasPreferences}
        />
      </div>
    </div>
  );
}
