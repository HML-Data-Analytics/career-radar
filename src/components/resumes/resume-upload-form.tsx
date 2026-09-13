"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadResumeAction } from "@/lib/actions/resumes";

export function ResumeUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadResumeAction, null);

  return (
    <form action={formAction} className="glass-panel flex flex-col gap-4 p-6">
      <div>
        <p className="font-medium">Upload a resume</p>
        <p className="text-sm text-muted-foreground">
          PDF or DOCX, up to 10 MB. The most recently uploaded resume becomes your active Master Resume.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input id="title" name="title" placeholder="e.g. Master Resume 2026" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">File</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
        />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </form>
  );
}
