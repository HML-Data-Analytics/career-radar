import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JobPasteForm } from "@/components/jobs/job-paste-form";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export default async function JobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("id, created_at, jobs(id, title, company, location, seniority)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: matches } = await supabase
    .from("job_matches")
    .select("job_id, overall_score, recommendation")
    .eq("user_id", user!.id);

  const matchByJobId = new Map(
    (matches ?? []).map((m) => [m.job_id, m]),
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
        {!savedJobs || savedJobs.length === 0 ? (
          <EmptyState title="No jobs yet" description="Jobs you add will show up here with their match scores." />
        ) : (
          <ul className="flex flex-col gap-2">
            {savedJobs.map((saved) => {
              const job = Array.isArray(saved.jobs) ? saved.jobs[0] : saved.jobs;
              if (!job) return null;
              const match = matchByJobId.get(job.id);
              return (
                <li key={saved.id}>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="glass flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-white/10"
                  >
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.company}
                        {job.location ? ` · ${job.location}` : ""}
                      </p>
                    </div>
                    {match ? (
                      <Badge variant={(match.overall_score ?? 0) >= 80 ? "default" : "secondary"}>
                        {match.overall_score}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not analyzed</Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
