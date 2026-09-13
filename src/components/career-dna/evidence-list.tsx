"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import {
  addEvidenceAction,
  deleteEvidenceAction,
  toggleEvidenceVerifiedAction,
  clearEvidenceAction,
} from "@/lib/actions/careerDna";
import { ClearAllButton } from "@/components/career-dna/clear-all-button";
import { Trash2, ShieldCheck, ShieldQuestion } from "lucide-react";

type Evidence = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  source: string | null;
  evidence_date: string | null;
  related_skills: string[] | null;
  verified: boolean;
};

const EVIDENCE_TYPES = [
  "project",
  "achievement",
  "leadership",
  "technical_implementation",
  "business_result",
  "certification",
  "client_experience",
  "industry_experience",
  "other",
];

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  const [state, formAction, isPending] = useActionState(addEvidenceAction, null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Only <span className="text-foreground">verified</span> evidence can be used as factual support when tailoring resumes or answering application questions. Mark evidence verified once you can back it up.
      </p>

      {evidence.length === 0 ? (
        <EmptyState
          title="No evidence yet"
          description="Add proof of projects, achievements, and results - this keeps every AI-generated claim truthful."
        />
      ) : (
        <>
        <div className="flex justify-end">
          <ClearAllButton itemLabel="evidence items" count={evidence.length} onConfirm={clearEvidenceAction} />
        </div>
        <ul className="flex flex-col gap-2">
          {evidence.map((item) => (
            <li key={item.id} className="glass flex items-start justify-between gap-4 rounded-xl p-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {item.type.replace(/_/g, " ")}
                  </Badge>
                </div>
                {item.description ? (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                ) : null}
                <div className="flex flex-wrap gap-1">
                  {(item.related_skills ?? []).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <form
                  action={toggleEvidenceVerifiedAction.bind(null, item.id, !item.verified)}
                >
                  <Button type="submit" variant="ghost" size="sm" className="gap-1.5">
                    {item.verified ? (
                      <>
                        <ShieldCheck className="size-4 text-accent" /> Verified
                      </>
                    ) : (
                      <>
                        <ShieldQuestion className="size-4 text-muted-foreground" /> Unverified
                      </>
                    )}
                  </Button>
                </form>
                <form action={deleteEvidenceAction.bind(null, item.id)}>
                  <Button type="submit" variant="ghost" size="icon">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
        </>
      )}

      <form action={formAction} className="glass flex flex-col gap-4 rounded-xl p-4">
        <p className="text-sm font-medium">Add evidence</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required className="glass border-white/20" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue="project">
              <SelectTrigger id="type" className="glass border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVIDENCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="source">Source</Label>
            <Input id="source" name="source" placeholder="e.g. performance review, client email" className="glass border-white/20" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="evidenceDate">Date</Label>
            <Input id="evidenceDate" name="evidenceDate" type="date" className="glass border-white/20" />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="relatedSkills">Related skills</Label>
            <Input id="relatedSkills" name="relatedSkills" placeholder="Comma-separated" className="glass border-white/20" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} className="glass border-white/20" />
        </div>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding…" : "Add evidence"}
          </Button>
        </div>
      </form>
    </div>
  );
}
