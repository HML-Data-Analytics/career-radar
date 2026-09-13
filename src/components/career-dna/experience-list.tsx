"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/empty-state";
import {
  addExperienceAction,
  deleteExperienceAction,
} from "@/lib/actions/careerDna";
import { Trash2 } from "lucide-react";

type Experience = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
};

export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  const [state, formAction, isPending] = useActionState(addExperienceAction, null);

  return (
    <div className="flex flex-col gap-4">
      {experiences.length === 0 ? (
        <EmptyState
          title="No experience added yet"
          description="Add roles from your career history to build your Career DNA."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {experiences.map((exp) => (
            <li key={exp.id} className="glass flex items-start justify-between gap-4 rounded-xl p-4">
              <div>
                <p className="font-medium">
                  {exp.title} · {exp.company}
                </p>
                <p className="text-sm text-muted-foreground">
                  {exp.location ? `${exp.location} · ` : ""}
                  {exp.start_date ?? "?"} - {exp.is_current ? "Present" : exp.end_date ?? "?"}
                </p>
                {exp.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                ) : null}
              </div>
              <form action={deleteExperienceAction.bind(null, exp.id)}>
                <Button type="submit" variant="ghost" size="icon">
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="glass flex flex-col gap-4 rounded-xl p-4">
        <p className="text-sm font-medium">Add experience</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required className="glass border-white/20" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" required className="glass border-white/20" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" className="glass border-white/20" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" name="startDate" type="date" className="glass border-white/20" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" name="endDate" type="date" className="glass border-white/20" />
          </div>
          <div className="flex items-center justify-between rounded-xl px-1 py-2">
            <Label htmlFor="isCurrent">Current role</Label>
            <Switch id="isCurrent" name="isCurrent" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} className="glass border-white/20" />
        </div>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding…" : "Add experience"}
          </Button>
        </div>
      </form>
    </div>
  );
}
