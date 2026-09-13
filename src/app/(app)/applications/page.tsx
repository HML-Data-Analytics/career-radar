import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/empty-state";
import { ApplicationStatusSelect } from "@/components/applications/status-select";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, next_action, next_action_date, applied_at, jobs(title, company)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">
          Track every application end to end. Kanban and timeline views, recruiter tracking, and follow-up reminders arrive in a later phase - this list view is fully functional today.
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <EmptyState
          title="No applications tracked yet"
          description="Analyze a job and move it into your pipeline to start tracking it here."
          href="/jobs"
          cta="Browse jobs"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {applications.map((app) => {
            const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
            return (
              <li key={app.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
                <div>
                  <p className="font-medium">{job?.title}</p>
                  <p className="text-sm text-muted-foreground">{job?.company}</p>
                </div>
                <ApplicationStatusSelect applicationId={app.id} status={app.status} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
