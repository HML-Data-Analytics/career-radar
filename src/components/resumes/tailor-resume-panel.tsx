"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateTailoredResumeAction } from "@/lib/actions/resumeTailor";
import type { TailoringIntensity } from "@/lib/validations/resumeTailor";
import { Sparkles } from "lucide-react";

type MasterResume = { id: string; title: string };

export function TailorResumePanel({
  jobId,
  masterResumes,
}: {
  jobId: string;
  masterResumes: MasterResume[];
}) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState(masterResumes[0]?.id ?? "");
  const [intensity, setIntensity] = useState<TailoringIntensity>("balanced");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (masterResumes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Upload a resume first to tailor it for this job.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Master resume</label>
        <Select value={resumeId} onValueChange={(v) => setResumeId(v ?? "")}>
          <SelectTrigger className="glass border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {masterResumes.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">Tailoring intensity</label>
        <Select value={intensity} onValueChange={(v) => setIntensity(v as TailoringIntensity)}>
          <SelectTrigger className="glass border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conservative">Conservative</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="aggressive">Aggressive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        className="gap-2"
        disabled={isPending || !resumeId}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await generateTailoredResumeAction({
              jobId,
              masterResumeId: resumeId,
              intensity,
            });
            if (result?.error) {
              setError(result.error);
            } else if (result?.resumeVersionId) {
              router.push(`/resumes/tailored/${result.resumeVersionId}`);
            }
          })
        }
      >
        <Sparkles className="size-4" />
        {isPending ? "Tailoring..." : "Tailor resume for this job"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
