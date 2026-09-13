"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { saveJobAction } from "@/lib/actions/discoverJobs";
import { Plus, Check, ExternalLink } from "lucide-react";

type DiscoveredJobRow = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  job_url: string | null;
  source_name: string | null;
};

export function DiscoveredJobsSection({ jobs }: { jobs: DiscoveredJobRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No discovered jobs match your preferences yet"
        description="New listings are pulled in automatically once a day. Set target roles/titles in Preferences to see relevant matches here, or add a job manually below."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {jobs.map((job) => {
        const saved = savedIds.has(job.id);
        return (
          <li key={job.id} className="glass flex items-start justify-between gap-3 rounded-xl p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{job.title}</p>
                {job.job_url ? (
                  <a
                    href={job.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {job.company}
                {job.location ? ` · ${job.location}` : ""}
              </p>
              {job.source_name ? (
                <p className="text-xs text-muted-foreground">via {job.source_name}</p>
              ) : null}
            </div>
            <Button
              size="sm"
              variant={saved ? "secondary" : "outline"}
              className="glass shrink-0 gap-1.5 border-white/20"
              disabled={saved || (isPending && savingId === job.id)}
              onClick={() => {
                setSavingId(job.id);
                startTransition(async () => {
                  const result = await saveJobAction(job.id);
                  if (result?.success) {
                    setSavedIds((prev) => new Set(prev).add(job.id));
                  }
                  setSavingId(null);
                });
              }}
            >
              {saved ? (
                <>
                  <Check className="size-3.5" /> Saved
                </>
              ) : (
                <>
                  <Plus className="size-3.5" /> Save
                </>
              )}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
