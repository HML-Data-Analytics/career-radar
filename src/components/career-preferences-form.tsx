"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertCareerPreferencesAction } from "@/lib/actions/careerPreferences";

type PreferencesRow = {
  target_roles: string[] | null;
  target_titles: string[] | null;
  seniority: string[] | null;
  industries: string[] | null;
  locations: string[] | null;
  remote_preference: string | null;
  min_salary: number | null;
  salary_currency: string | null;
  employment_type: string[] | null;
  preferred_companies: string[] | null;
  excluded_companies: string[] | null;
  required_technologies: string[] | null;
  preferred_technologies: string[] | null;
  max_commute_minutes: number | null;
  visa_sponsorship_needed: boolean | null;
  open_to_relocation: boolean | null;
  travel_tolerance: string | null;
  career_direction: string | null;
  preferred_company_size: string[] | null;
} | null;

function join(list: string[] | null | undefined) {
  return (list ?? []).join(", ");
}

export function CareerPreferencesForm({ prefs }: { prefs: PreferencesRow }) {
  const [state, formAction, isPending] = useActionState(
    upsertCareerPreferencesAction,
    null,
  );

  return (
    <form action={formAction} className="glass-panel flex flex-col gap-6 p-6">
      <Section title="Target opportunities">
        <ListField label="Target roles" name="targetRoles" defaultValue={join(prefs?.target_roles)} />
        <ListField label="Target titles" name="targetTitles" defaultValue={join(prefs?.target_titles)} />
        <ListField label="Seniority" name="seniority" defaultValue={join(prefs?.seniority)} placeholder="Director, VP, Senior IC" />
        <ListField label="Industries" name="industries" defaultValue={join(prefs?.industries)} />
      </Section>

      <Section title="Location & work style">
        <ListField label="Locations" name="locations" defaultValue={join(prefs?.locations)} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="remotePreference">Remote preference</Label>
          <Select name="remotePreference" defaultValue={prefs?.remote_preference ?? undefined}>
            <SelectTrigger id="remotePreference" className="glass border-white/20">
              <SelectValue placeholder="No preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="on_site">On-site</SelectItem>
              <SelectItem value="no_preference">No preference</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field label="Max commute (minutes)" name="maxCommuteMinutes" type="number" defaultValue={prefs?.max_commute_minutes?.toString() ?? ""} />
        <Field label="Travel tolerance" name="travelTolerance" defaultValue={prefs?.travel_tolerance ?? ""} placeholder="e.g. up to 20%" />
        <div className="flex items-center justify-between rounded-xl px-1 py-2">
          <Label htmlFor="openToRelocation">Open to relocation</Label>
          <Switch id="openToRelocation" name="openToRelocation" defaultChecked={prefs?.open_to_relocation ?? false} />
        </div>
        <div className="flex items-center justify-between rounded-xl px-1 py-2">
          <Label htmlFor="visaSponsorshipNeeded">Visa sponsorship needed</Label>
          <Switch id="visaSponsorshipNeeded" name="visaSponsorshipNeeded" defaultChecked={prefs?.visa_sponsorship_needed ?? false} />
        </div>
      </Section>

      <Section title="Compensation & employment">
        <Field label="Minimum salary" name="minSalary" type="number" defaultValue={prefs?.min_salary?.toString() ?? ""} />
        <Field label="Currency" name="salaryCurrency" defaultValue={prefs?.salary_currency ?? ""} placeholder="USD" />
        <ListField label="Employment type" name="employmentType" defaultValue={join(prefs?.employment_type)} placeholder="Full-time, Contract" />
        <ListField label="Preferred company size" name="preferredCompanySize" defaultValue={join(prefs?.preferred_company_size)} placeholder="Startup, Enterprise" />
      </Section>

      <Section title="Companies & technologies">
        <ListField label="Preferred companies" name="preferredCompanies" defaultValue={join(prefs?.preferred_companies)} />
        <ListField label="Excluded companies" name="excludedCompanies" defaultValue={join(prefs?.excluded_companies)} />
        <ListField label="Required technologies" name="requiredTechnologies" defaultValue={join(prefs?.required_technologies)} />
        <ListField label="Preferred technologies" name="preferredTechnologies" defaultValue={join(prefs?.preferred_technologies)} />
      </Section>

      <div className="flex flex-col gap-2">
        <Label htmlFor="careerDirection">Career direction notes</Label>
        <Textarea
          id="careerDirection"
          name="careerDirection"
          rows={3}
          defaultValue={prefs?.career_direction ?? ""}
          className="glass border-white/20"
        />
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-accent">Saved.</p> : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
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
        className="glass border-white/20"
      />
    </div>
  );
}

function ListField({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder ?? "Comma-separated"}
        className="glass border-white/20"
      />
    </div>
  );
}
