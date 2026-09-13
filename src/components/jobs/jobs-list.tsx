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

const AI_RECOMMENDED = new Set(["RECOMMEND", "STRONGLY_RECOMMEND"]);

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
  const [aiSuggestedOnly, setAiSuggestedOnly] = useState(false);

  const filtered = useMemo(() => {
    if (!aiSuggestedOnly) return savedJobs;
    return savedJobs.filter((saved) => {
      const recommendation = matchByJobId[saved.job.id]?.recommendation;
      return recommendation ? AI_RECOMMENDED.has(recommendation) : false;
    });
  }, [savedJobs, aiSuggestedOnly, matchByJobId]);

  const sorted = useMemo(() => {
    if (!prioritizeMatches) return filtered;
    return [...filtered].sort((a, b) => {
      const aMatch = jobMatchesPreferences(a.job, prefs) ? 1 : 0;
      const bMatch = jobMatchesPreferences(b.job, prefs) ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [filtered, prioritizeMatches, prefs]);

  if (savedJobs.length === 0) {
    return <EmptyState title="No jobs yet" description="Jobs you add will show up here with their match scores." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="ai-suggested-only" className="text-sm text-muted-foreground">
            AI Suggested only
          </Label>
          <Switch
            id="ai-suggested-only"
            checked={aiSuggestedOnly}
            onCheckedChange={setAiSuggestedOnly}
          />
        </div>
        {hasPreferences ? (
          <div className="flex items-center gap-2">
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
      </div>

      {aiSuggestedOnly && sorted.length === 0 ? (
        <EmptyState
          title="No AI-recommended jobs yet"
          description="Open a saved job and analyze it to get an AI recommendation. Jobs the AI recommends or strongly recommends will show up here."
        />
      ) : null}

      <ul className="flex flex-col gap-2">
        {sorted.map((saved) => {
          const match = matchByJobId[saved.job.id];
          const matchesPrefs = jobMatchesPreferences(saved.job, prefs);
          const isAiSuggested = match?.recommendation
            ? AI_RECOMMENDED.has(match.recommendation)
            : false;
          return (
            <li key={saved.id}>
              <Link
                href={`/jobs/${saved.job.id}`}
                className="glass flex items-center justify-between gap-3 rounded-xl p-4 transition-colors hover:bg-white/10"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{saved.job.title}</p>
                    {isAiSuggested ? (
                      <Badge className="shrink-0 text-xs">AI Suggested</Badge>
                    ) : null}
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
