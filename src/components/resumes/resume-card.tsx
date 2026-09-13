"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  parseResumeIntoCareerDnaAction,
  importParsedResumeAction,
  analyzeResumeQualityAction,
  setActiveResumeAction,
  deleteResumeAction,
} from "@/lib/actions/resumes";
import { ParsedResumePreview } from "@/components/resumes/parsed-resume-preview";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import type { ResumeQualityScore } from "@/lib/validations/resumeQuality";
import type { ParsedResume } from "@/lib/validations/resumeParse";
import { Sparkles, Import, Trash2, Star } from "lucide-react";

type Resume = {
  id: string;
  title: string;
  file_type: string | null;
  is_active: boolean;
  created_at: string;
  parsed_content:
    | (Partial<ParsedResume> & { qualityScore?: ResumeQualityScore })
    | null;
};

const QUALITY_LABELS: { key: keyof ResumeQualityScore; label: string }[] = [
  { key: "atsCompatibility", label: "ATS Compatibility" },
  { key: "impact", label: "Impact" },
  { key: "clarity", label: "Clarity" },
  { key: "keywordCoverage", label: "Keyword Coverage" },
  { key: "leadershipPositioning", label: "Leadership Positioning" },
  { key: "quantification", label: "Quantification" },
  { key: "readability", label: "Readability" },
];

export function ResumeCard({ resume }: { resume: Resume }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const hasParsedContent =
    !!resume.parsed_content &&
    Object.keys(resume.parsed_content).some((k) => k !== "qualityScore");
  const quality = resume.parsed_content?.qualityScore;
  const parsed: ParsedResume | null = hasParsedContent
    ? {
        headline: resume.parsed_content?.headline ?? null,
        professionalSummary: resume.parsed_content?.professionalSummary ?? null,
        currentTitle: resume.parsed_content?.currentTitle ?? null,
        currentCompany: resume.parsed_content?.currentCompany ?? null,
        currentLocation: resume.parsed_content?.currentLocation ?? null,
        yearsOfExperience: resume.parsed_content?.yearsOfExperience ?? null,
        experiences: resume.parsed_content?.experiences ?? [],
        skills: resume.parsed_content?.skills ?? [],
        certifications: resume.parsed_content?.certifications ?? [],
        education: resume.parsed_content?.education ?? [],
      }
    : null;

  function run(
    action: string,
    fn: () => Promise<
      | { error?: string; warning?: string; imported?: Record<string, number> }
      | void
    >,
  ) {
    setError(null);
    setNotice(null);
    setPendingAction(action);
    startTransition(async () => {
      const result = await fn();
      if (result && "error" in result && result.error) {
        setError(result.error);
      } else if (result && "warning" in result && result.warning) {
        setNotice(result.warning);
      } else if (action === "import" && result && "imported" in result && result.imported) {
        const counts = Object.entries(result.imported)
          .filter(([, n]) => n > 0)
          .map(([k, n]) => `${n} ${k}`)
          .join(", ");
        setNotice(counts ? `Imported: ${counts}.` : null);
      }
      setPendingAction(null);
    });
  }

  return (
    <div className="glass-panel flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{resume.title}</p>
            {resume.is_active ? (
              <Badge className="gap-1">
                <Star className="size-3" /> Active
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {resume.file_type === "application/pdf" ? "PDF" : "DOCX"} - uploaded{" "}
            {new Date(resume.created_at).toLocaleDateString()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
        <ConfirmDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={`Delete "${resume.title}"?`}
          description="This permanently deletes the uploaded file and its parsed data. This does not affect anything already imported into your Career DNA. This cannot be undone."
          confirmLabel="Delete resume"
          onConfirm={() => deleteResumeAction(resume.id)}
        />
      </div>

      {parsed ? <ParsedResumePreview parsed={parsed} /> : null}

      {quality ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Resume Quality</p>
            <Badge variant={quality.overall >= 75 ? "default" : "secondary"}>
              {quality.overall}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {QUALITY_LABELS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{label}</span>
                  <span>{quality[key] as number}</span>
                </div>
                <Progress value={quality[key] as number} className="h-1.5" />
              </div>
            ))}
          </div>
          {quality.concerns.length > 0 ? (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">Concerns</p>
              <ul className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                {quality.concerns.map((c) => (
                  <li key={c}>- {c}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {!resume.is_active ? (
          <Button
            variant="outline"
            size="sm"
            className="glass gap-1.5 border-white/20"
            disabled={isPending}
            onClick={() => run("activate", () => setActiveResumeAction(resume.id))}
          >
            <Star className="size-3.5" />
            {pendingAction === "activate" ? "Setting..." : "Set active"}
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          className="glass gap-1.5 border-white/20"
          disabled={isPending}
          onClick={() =>
            run("parse", () => parseResumeIntoCareerDnaAction(resume.id))
          }
        >
          <Sparkles className="size-3.5" />
          {pendingAction === "parse" ? "Parsing..." : "Parse with AI"}
        </Button>

        {hasParsedContent ? (
          <Button
            variant="outline"
            size="sm"
            className="glass gap-1.5 border-white/20"
            disabled={isPending}
            title="Imports experience, skills, certifications, and education. Evidence is added separately on the Career DNA page."
            onClick={() =>
              run("import", () => importParsedResumeAction(resume.id))
            }
          >
            <Import className="size-3.5" />
            {pendingAction === "import" ? "Importing..." : "Import into Career DNA"}
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          className="glass gap-1.5 border-white/20"
          disabled={isPending}
          onClick={() =>
            run("quality", () => analyzeResumeQualityAction(resume.id))
          }
        >
          <Sparkles className="size-3.5" />
          {pendingAction === "quality" ? "Scoring..." : "Score quality"}
        </Button>
      </div>

      {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
