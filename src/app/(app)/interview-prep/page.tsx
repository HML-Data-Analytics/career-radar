import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export default async function InterviewPrepPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from("applications")
    .select("id, status, jobs(title, company), interview_preparation(id)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Interview Prep</h1>
        <p className="text-muted-foreground">
          Generated per application, from your verified Career DNA. Open an application to generate or review its prep.
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Track an application to start preparing for its interview."
          href="/applications"
          cta="Go to Applications"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {applications.map((app) => {
            const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
            const prep = Array.isArray(app.interview_preparation)
              ? app.interview_preparation[0]
              : app.interview_preparation;
            return (
              <li key={app.id}>
                <Link
                  href={`/applications/${app.id}`}
                  className="glass flex items-center justify-between rounded-xl p-4 transition-colors hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{job?.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{job?.company}</p>
                  </div>
                  <Badge variant={prep ? "default" : "outline"} className="shrink-0">
                    {prep ? "Prepared" : "Not prepared"}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
