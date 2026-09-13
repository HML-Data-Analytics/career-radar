"use client";

import { useActionState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { addSkillAction, deleteSkillAction, clearSkillsAction } from "@/lib/actions/careerDna";
import { ClearAllButton } from "@/components/career-dna/clear-all-button";
import { Trash2 } from "lucide-react";

type Skill = {
  id: string;
  skill: string;
  category: string | null;
  proficiency: string | null;
  years_experience: number | null;
  verified: boolean;
};

const CATEGORY_ORDER = [
  "technical",
  "leadership",
  "domain",
  "tool",
  "soft",
  "language",
  "other",
];

const CATEGORY_LABELS: Record<string, string> = {
  technical: "Technical",
  leadership: "Leadership",
  domain: "Domain",
  tool: "Tools",
  soft: "Soft skills",
  language: "Languages",
  other: "Other",
};

function normalizeCategory(category: string | null): string {
  if (!category) return "other";
  const key = category.toLowerCase().trim();
  return key in CATEGORY_LABELS ? key : "other";
}

function groupByCategory(skills: Skill[]): Array<[string, Skill[]]> {
  const groups = new Map<string, Skill[]>();
  for (const skill of skills) {
    const key = normalizeCategory(skill.category);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(skill);
  }
  return CATEGORY_ORDER.filter((key) => groups.has(key)).map((key) => [
    key,
    groups.get(key)!.sort((a, b) => a.skill.localeCompare(b.skill)),
  ]);
}

function proficiencyYearsLabel(skill: Skill): string | null {
  const parts = [
    skill.proficiency,
    skill.years_experience
      ? `${skill.years_experience} yr${skill.years_experience === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function DeleteSkillButton({ skill }: { skill: Skill }) {
  return (
    <form action={deleteSkillAction.bind(null, skill.id)}>
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${skill.skill}`}
      >
        <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
      </Button>
    </form>
  );
}

export function SkillList({ skills }: { skills: Skill[] }) {
  const [state, formAction, isPending] = useActionState(addSkillAction, null);
  const grouped = useMemo(() => groupByCategory(skills), [skills]);

  return (
    <div className="flex flex-col gap-4">
      {skills.length === 0 ? (
        <EmptyState title="No skills added yet" description="Add skills with verified evidence to strengthen matching." />
      ) : (
        <>
        <div className="flex justify-end">
          <ClearAllButton itemLabel="skills" count={skills.length} onConfirm={clearSkillsAction} />
        </div>
        <div className="glass-panel flex flex-col divide-y divide-border overflow-hidden">
          {grouped.map(([category, categorySkills]) => (
            <div key={category}>
              <p className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {CATEGORY_LABELS[category]} ({categorySkills.length})
              </p>

              {/* Mobile: stacked rows instead of a table. A 4-column table
                  (skill, proficiency, years, delete) can't fit a real skill
                  name at phone width without truncating badly or forcing
                  horizontal scroll on a list meant to be scanned. */}
              <ul className="flex flex-col divide-y divide-border sm:hidden">
                {categorySkills.map((skill) => (
                  <li key={skill.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium">{skill.skill}</p>
                      {proficiencyYearsLabel(skill) ? (
                        <p className="text-sm text-muted-foreground capitalize">
                          {proficiencyYearsLabel(skill)}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0">
                      <DeleteSkillButton skill={skill} />
                    </div>
                  </li>
                ))}
              </ul>

              {/* sm and up: full table */}
              <div className="hidden overflow-x-auto sm:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Skill</TableHead>
                      <TableHead>Proficiency</TableHead>
                      <TableHead>Years</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categorySkills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell className="font-medium">{skill.skill}</TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                          {skill.proficiency ?? "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {skill.years_experience ?? "-"}
                        </TableCell>
                        <TableCell>
                          <DeleteSkillButton skill={skill} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      <form action={formAction} className="glass flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="flex flex-col gap-2">
          <Label htmlFor="skill">Skill</Label>
          <Input id="skill" name="skill" required className="glass border-white/20" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category">
            <SelectTrigger id="category" className="glass w-40 border-white/20">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ORDER.map((key) => (
                <SelectItem key={key} value={key}>
                  {CATEGORY_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="proficiency">Proficiency</Label>
          <Select name="proficiency">
            <SelectTrigger id="proficiency" className="glass w-40 border-white/20">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="yearsExperience">Years</Label>
          <Input id="yearsExperience" name="yearsExperience" type="number" className="glass w-24 border-white/20" />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add skill"}
        </Button>
      </form>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </div>
  );
}
