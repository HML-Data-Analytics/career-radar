"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { jobMatchesPreferences } from "@/lib/jobs/matchesPreferences";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  seniority: string | null;
  industry: string | null;
  remote_type: string | null;
};

type SavedJob = {
  id: string;
  job: Job;
};

type Match = { overall_score: number | null; recommendation: string | null };

type Prefs = {
  locations: string[] | null;
  seniority: string[] | null;
  industries: string[] | null;
  remote_preference: string | null;
} | null;

export function JobsList({
  savedJobs,
  matchByJobId,
  prefs,
  hasPreferences,
}: {
  savedJobs: SavedJob[];
  matchByJobId: Record<string, Match>;
  prefs: Prefs;
  hasPreferences: boolean;
}) {
  const [prioritizeMatches, setPrioritizeMatches] = useState(hasPreferences);

  const sorted = useMemo(() => {
    if (!prioritizeMatches) return savedJobs;
    return [...savedJobs].sort((a, b) => {
      const aMatch = jobMatchesPreferences(a.job, prefs) ? 1 : 0;
      const bMatch = jobMatchesPreferences(b.job, prefs) ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [savedJobs, prioritizeMatches, prefs]);

  if (savedJobs.length === 0) {
    return <EmptyState title="No jobs yet" description="Jobs you add will show up here with their match scores." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {hasPreferences ? (
        <div className="flex items-center justify-end gap-2">
          <Label htmlFor="prioritize-matches" className="text-sm text-muted-foreground">
            Prioritize jobs matching my preferences
          </Label>
          <Switch
            id="prioritize-matches"
            checked={prioritizeMatches}
            onCheckedChange={setPrioritizeMatches}
          />
        </div>
      ) : null}

      <ul className="flex flex-col gap-2">
        {sorted.map((saved) => {
          const match = matchByJobId[saved.job.id];
          const matchesPrefs = jobMatchesPreferences(saved.job, prefs);
          return (
            <li key={saved.id}>
              <Link
                href={`/jobs/${saved.job.id}`}
                className="glass flex items-center justify-between gap-3 rounded-xl p-4 transition-colors hover:bg-white/10"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{saved.job.title}</p>
                    {hasPreferences && matchesPrefs ? (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        Matches your preferences
                      </Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {saved.job.company}
                    {saved.job.location ? ` · ${saved.job.location}` : ""}
                  </p>
                </div>
                {match ? (
                  <Badge
                    variant={(match.overall_score ?? 0) >= 80 ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {match.overall_score}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0">
                    Not analyzed
                  </Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
