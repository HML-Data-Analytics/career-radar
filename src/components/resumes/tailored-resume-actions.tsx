"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  approveTailoredResumeAction,
  scoreTailoredResumeQualityAction,
} from "@/lib/actions/resumeTailor";
import { CircleCheck, Sparkles } from "lucide-react";

export function TailoredResumeActions({
  versionId,
  state,
}: {
  versionId: string;
  state: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(action: string, fn: () => Promise<{ error?: string } | void>) {
    setError(null);
    setPendingAction(action);
    startTransition(async () => {
      const result = await fn();
      if (result && "error" in result && result.error) setError(result.error);
      setPendingAction(null);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="glass gap-1.5 border-white/20"
          disabled={isPending}
          onClick={() =>
            run("quality", () => scoreTailoredResumeQualityAction(versionId))
          }
        >
          <Sparkles className="size-3.5" />
          {pendingAction === "quality" ? "Scoring..." : "Score quality"}
        </Button>
        {state !== "APPROVED" ? (
          <Button
            size="sm"
            className="gap-1.5"
            disabled={isPending}
            onClick={() =>
              run("approve", () => approveTailoredResumeAction(versionId))
            }
          >
            <CircleCheck className="size-3.5" />
            {pendingAction === "approve" ? "Approving..." : "Approve"}
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
