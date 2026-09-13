import { Progress } from "@/components/ui/progress";
import { CircleCheck, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type PreferencesRow = {
  target_roles: string[] | null;
  seniority: string[] | null;
  locations: string[] | null;
  remote_preference: string | null;
  industries: string[] | null;
  min_salary: number | null;
} | null;

const FIELDS: { key: keyof NonNullable<PreferencesRow>; label: string }[] = [
  { key: "target_roles", label: "Target roles" },
  { key: "seniority", label: "Seniority" },
  { key: "locations", label: "Locations" },
  { key: "remote_preference", label: "Remote preference" },
  { key: "industries", label: "Industries" },
  { key: "min_salary", label: "Minimum salary" },
];

function isFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== "";
}

export function PreferencesChecklist({ prefs }: { prefs: PreferencesRow }) {
  const completed = FIELDS.filter((f) => isFilled(prefs?.[f.key])).length;
  if (completed === FIELDS.length) return null;

  const percent = Math.round((completed / FIELDS.length) * 100);

  return (
    <div className="glass-panel flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <p className="font-medium">Fill out your key preferences</p>
        <span className="text-sm text-muted-foreground">
          {completed}/{FIELDS.length}
        </span>
      </div>
      <Progress value={percent} className="h-1.5" />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {FIELDS.map((field) => {
          const done = isFilled(prefs?.[field.key]);
          return (
            <li
              key={field.key}
              className={cn(
                "flex items-center gap-2 text-sm",
                done ? "text-muted-foreground line-through" : "text-foreground",
              )}
            >
              {done ? (
                <CircleCheck className="size-3.5 shrink-0 text-primary" />
              ) : (
                <Circle className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              {field.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
