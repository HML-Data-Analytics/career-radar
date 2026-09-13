"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { analyzeJobMatchAction } from "@/lib/actions/jobMatch";
import { Sparkles } from "lucide-react";

export function AnalyzeJobButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <Button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await analyzeJobMatchAction(jobId);
            if (result?.error) setError(result.error);
          })
        }
        className="gap-2"
      >
        <Sparkles className="size-4" />
        {isPending ? "Analyzing…" : "Analyze this job"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
