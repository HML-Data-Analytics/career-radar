import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { JobPasteForm } from "@/components/jobs/job-paste-form";
import { JobsList } from "@/components/jobs/jobs-list";

export default async function JobsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const [{ data: savedJobsRaw }, { data: matches }, { data: prefs }] = await Promise.all([
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
      .select("locations, seniority, industries, remote_preference")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  const savedJobs = (savedJobsRaw ?? [])
    .map((saved) => {
      const job = Array.isArray(saved.jobs) ? saved.jobs[0] : saved.jobs;
      return job ? { id: saved.id, job } : null;
    })
    .filter((s): s is { id: string; job: NonNullable<typeof s>["job"] } => s !== null);

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">
          Add jobs manually for now - pluggable job sources (Greenhouse, Lever, approved APIs) come in a later phase.
        </p>
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
