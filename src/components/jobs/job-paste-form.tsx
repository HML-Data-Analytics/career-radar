"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitJobAction } from "@/lib/actions/jobs";

export function JobPasteForm() {
  const [state, formAction, isPending] = useActionState(submitJobAction, null);

  return (
    <form action={formAction} className="glass-panel flex flex-col gap-4 p-6">
      <div>
        <p className="font-medium">Add a job</p>
        <p className="text-sm text-muted-foreground">
          Paste a job URL or the full job description. We parse it, analyze it, and score it against your Career DNA.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="jobUrl">Job URL</Label>
        <Input
          id="jobUrl"
          name="jobUrl"
          type="url"
          placeholder="https://…"
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="jobDescription">Paste job description</Label>
        <Textarea
          id="jobDescription"
          name="jobDescription"
          rows={8}
          placeholder="Paste the full job description here…"
        />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Analyzing…" : "Analyze job"}
        </Button>
      </div>
    </form>
  );
}
