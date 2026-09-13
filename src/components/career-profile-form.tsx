"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertCareerProfileAction } from "@/lib/actions/careerProfile";

type CareerProfileRow = {
  headline: string | null;
  professional_summary: string | null;
  years_of_experience: number | null;
  current_title: string | null;
  current_company: string | null;
  current_location: string | null;
  career_level: string | null;
  career_direction: string | null;
  career_ambition: string | null;
} | null;

export function CareerProfileForm({ profile }: { profile: CareerProfileRow }) {
  const [state, formAction, isPending] = useActionState(
    upsertCareerProfileAction,
    null,
  );

  return (
    <form action={formAction} className="glass-panel flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Headline" name="headline" defaultValue={profile?.headline ?? ""} />
        <Field
          label="Years of experience"
          name="yearsOfExperience"
          type="number"
          defaultValue={profile?.years_of_experience?.toString() ?? ""}
        />
        <Field
          label="Current title"
          name="currentTitle"
          defaultValue={profile?.current_title ?? ""}
        />
        <Field
          label="Current company"
          name="currentCompany"
          defaultValue={profile?.current_company ?? ""}
        />
        <Field
          label="Current location"
          name="currentLocation"
          defaultValue={profile?.current_location ?? ""}
        />
        <Field
          label="Career level"
          name="careerLevel"
          defaultValue={profile?.career_level ?? ""}
          placeholder="e.g. Director, Senior IC, VP"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="professionalSummary">Professional summary</Label>
        <Textarea
          id="professionalSummary"
          name="professionalSummary"
          rows={4}
          defaultValue={profile?.professional_summary ?? ""}
         
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="careerDirection">Career direction</Label>
        <Textarea
          id="careerDirection"
          name="careerDirection"
          rows={3}
          placeholder="Where do you want your career to go next?"
          defaultValue={profile?.career_direction ?? ""}
         
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="careerAmbition">Career ambition</Label>
        <Textarea
          id="careerAmbition"
          name="careerAmbition"
          rows={3}
          placeholder="What does long-term success look like for you?"
          defaultValue={profile?.career_ambition ?? ""}
         
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-accent">Saved.</p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
       
      />
    </div>
  );
}
