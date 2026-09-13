"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  discoverJobsAction,
  addDiscoveredJobAction,
  type DiscoverJobsResult,
} from "@/lib/actions/discoverJobs";
import { Search, Plus, Check, ExternalLink } from "lucide-react";

const AUTO_SEARCH_CACHE_KEY = "career-radar:auto-discover-cache";
// Remotive's own terms ask for at most ~4 requests/day site-wide, so
// auto-running this on every Jobs page visit needs a floor - cached
// results are reused within this window instead of re-searching.
const AUTO_SEARCH_MIN_INTERVAL_MS = 15 * 60 * 1000;

type CachedSearch = { results: DiscoverJobsResult[]; timestamp: number };

function readCache(): CachedSearch | null {
  try {
    const raw = localStorage.getItem(AUTO_SEARCH_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedSearch;
  } catch {
    return null;
  }
}

function writeCache(results: DiscoverJobsResult[]) {
  try {
    localStorage.setItem(
      AUTO_SEARCH_CACHE_KEY,
      JSON.stringify({ results, timestamp: Date.now() }),
    );
  } catch {
    // localStorage unavailable (private mode, etc.) - just skip caching.
  }
}

export function DiscoverJobsPanel({
  canAutoDiscover,
}: {
  canAutoDiscover: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<DiscoverJobsResult[] | null>(() => {
    if (!canAutoDiscover || typeof window === "undefined") return null;
    const cached = readCache();
    if (cached && Date.now() - cached.timestamp < AUTO_SEARCH_MIN_INTERVAL_MS) {
      return cached.results;
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [autoSearched, setAutoSearched] = useState(() => results !== null);
  const hasAutoRun = useRef(results !== null);

  function runSearch(searchQuery?: string) {
    setError(null);
    startTransition(async () => {
      const result = await discoverJobsAction(searchQuery ?? query);
      if ("error" in result) {
        setError(result.error);
        setResults(null);
      } else {
        setResults(result.results);
        writeCache(result.results);
      }
    });
  }

  useEffect(() => {
    if (!canAutoDiscover || hasAutoRun.current) return;
    hasAutoRun.current = true;
    setAutoSearched(true);
    runSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAutoDiscover]);

  return (
    <div className="glass-panel flex flex-col gap-4 p-5">
      <div>
        <p className="font-medium">Discover jobs</p>
        <p className="text-sm text-muted-foreground">
          Searches remote job listings from Remotive&apos;s free tier - a small, periodically-refreshed pool (not comprehensive), matched against your saved preferences. Leave the search blank to use your target roles/titles automatically. You can always add any job manually below too.
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          placeholder="e.g. Product Manager"
          className="glass border-white/20"
        />
        <Button onClick={() => runSearch()} disabled={isPending} className="shrink-0 gap-2">
          <Search className="size-4" />
          {isPending ? "Searching..." : "Search"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {results ? (
        <div className="flex flex-col gap-4">
          {autoSearched && !query ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Auto-searched using your saved target roles/titles.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto gap-1 p-0 text-xs text-muted-foreground hover:text-foreground"
                disabled={isPending}
                onClick={() => runSearch("")}
              >
                Refresh
              </Button>
            </div>
          ) : null}
          {results.map((source) => (
            <div key={source.sourceId} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {source.jobs.length} result{source.jobs.length === 1 ? "" : "s"} from {source.sourceName}
                </p>
              </div>
              {source.error ? (
                <p className="text-sm text-destructive">{source.error}</p>
              ) : source.jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matches.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {source.jobs.map((job) => {
                    const key = `${source.sourceId}:${job.sourceJobId}`;
                    const added = job.alreadySaved || addedIds.has(key);
                    return (
                      <li key={key} className="glass flex items-start justify-between gap-3 rounded-xl p-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">{job.title}</p>
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 text-muted-foreground hover:text-foreground"
                              title={`View on ${source.sourceName}`}
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {job.company}
                            {job.location ? ` · ${job.location}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            via {source.sourceName}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={added ? "secondary" : "outline"}
                          className="glass shrink-0 gap-1.5 border-white/20"
                          disabled={added || (isPending && addingId === key)}
                          onClick={() => {
                            setAddingId(key);
                            startTransition(async () => {
                              const result = await addDiscoveredJobAction(
                                source.sourceId,
                                job,
                              );
                              if (result?.success) {
                                setAddedIds((prev) => new Set(prev).add(key));
                              }
                              setAddingId(null);
                            });
                          }}
                        >
                          {added ? (
                            <>
                              <Check className="size-3.5" /> Added
                            </>
                          ) : (
                            <>
                              <Plus className="size-3.5" /> Add
                            </>
                          )}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Job listings courtesy of{" "}
            <a href="https://remotive.com" target="_blank" rel="noreferrer" className="underline underline-offset-4">
              Remotive
            </a>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
