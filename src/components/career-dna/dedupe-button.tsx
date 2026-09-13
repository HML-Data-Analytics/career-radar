"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { dedupeCareerDnaAction } from "@/lib/actions/careerDna";
import { Sparkles } from "lucide-react";

export function DedupeButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        className="glass gap-1.5 border-white/20"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setMessage(null);
            setError(null);
            const result = await dedupeCareerDnaAction();
            if (result?.error) {
              setError(result.error);
            } else if (result?.removed === 0) {
              setMessage("No duplicates found.");
            } else {
              setMessage(`Removed ${result?.removed} duplicate ${result?.removed === 1 ? "entry" : "entries"}.`);
            }
          })
        }
      >
        <Sparkles className="size-3.5" />
        {isPending ? "Checking..." : "Remove duplicates"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
