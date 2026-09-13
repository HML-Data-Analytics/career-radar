"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generatePreferenceSuggestionsAction,
  applyPreferenceSuggestionsAction,
} from "@/lib/actions/preferenceSuggestions";
import type { PreferenceSuggestions } from "@/lib/validations/preferenceSuggestions";
import { Sparkles, Check, X } from "lucide-react";

const GROUPS: { key: keyof PreferenceSuggestions; label: string }[] = [
  { key: "targetRoles", label: "Target roles" },
  { key: "targetTitles", label: "Target titles" },
  { key: "seniority", label: "Seniority" },
  { key: "industries", label: "Industries" },
  { key: "locations", label: "Locations" },
  { key: "preferredTechnologies", label: "Preferred technologies" },
];

export function PreferenceSuggestionsPanel() {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<PreferenceSuggestions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  if (applied) {
    return (
      <div className="glass-panel flex items-center gap-2 p-4 text-sm">
        <Check className="size-4 text-primary" />
        Suggestions applied to your preferences below.
      </div>
    );
  }

  if (!suggestions) {
    return (
      <div className="glass-panel flex flex-col gap-2 p-5">
        <p className="font-medium">Not sure where to start?</p>
        <p className="text-sm text-muted-foreground">
          Get preference suggestions based on your Career Profile and experience - you review and choose what to keep, nothing is applied automatically.
        </p>
        <Button
          className="w-fit gap-2"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await generatePreferenceSuggestionsAction();
              if ("error" in result) {
                setError(result.error);
              } else {
                setSuggestions(result.suggestions);
              }
            })
          }
        >
          <Sparkles className="size-4" />
          {isPending ? "Generating..." : "Suggest preferences"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="glass-panel flex flex-col gap-4 p-5">
      <div>
        <p className="font-medium">Suggested preferences</p>
        <p className="text-sm text-muted-foreground">{suggestions.reasoning}</p>
      </div>

      <div className="flex flex-col gap-3">
        {GROUPS.map(({ key, label }) => {
          const values = suggestions[key] as string[];
          if (!values || values.length === 0) return null;
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {values.map((v) => (
                  <Badge key={v} variant="secondary" className="text-xs">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className="gap-2"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await applyPreferenceSuggestionsAction(suggestions);
              if (result?.error) {
                setError(result.error);
              } else {
                setApplied(true);
              }
            })
          }
        >
          <Check className="size-4" />
          {isPending ? "Applying..." : "Apply these"}
        </Button>
        <Button
          variant="outline"
          className="glass gap-2 border-white/20"
          disabled={isPending}
          onClick={() => setSuggestions(null)}
        >
          <X className="size-4" />
          Dismiss
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
