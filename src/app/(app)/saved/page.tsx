import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export default async function SavedPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("id, notes, created_at, jobs(id, title, company, location)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Saved</h1>
        <p className="text-muted-foreground">Jobs you&apos;ve bookmarked for later review.</p>
      </div>

      {!savedJobs || savedJobs.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Jobs you add are automatically saved here."
          href="/jobs"
          cta="Browse jobs"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {savedJobs.map((saved) => {
            const job = Array.isArray(saved.jobs) ? saved.jobs[0] : saved.jobs;
            if (!job) return null;
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
                  <Badge variant="outline">Saved</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
