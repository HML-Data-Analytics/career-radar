"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { addSkillAction, deleteSkillAction } from "@/lib/actions/careerDna";
import { Trash2 } from "lucide-react";

type Skill = {
  id: string;
  skill: string;
  category: string | null;
  proficiency: string | null;
  years_experience: number | null;
  verified: boolean;
};

export function SkillList({ skills }: { skills: Skill[] }) {
  const [state, formAction, isPending] = useActionState(addSkillAction, null);

  return (
    <div className="flex flex-col gap-4">
      {skills.length === 0 ? (
        <EmptyState title="No skills added yet" description="Add skills with verified evidence to strengthen matching." />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li key={skill.id}>
              <Badge variant="secondary" className="glass gap-2 py-1.5 pl-3 pr-1.5">
                {skill.skill}
                {skill.proficiency ? (
                  <span className="text-muted-foreground">· {skill.proficiency}</span>
                ) : null}
                <form action={deleteSkillAction.bind(null, skill.id)}>
                  <button
                    type="submit"
                    aria-label={`Remove ${skill.skill}`}
                    className="-m-2 p-2"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </form>
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="glass flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="flex flex-col gap-2">
          <Label htmlFor="skill">Skill</Label>
          <Input id="skill" name="skill" required className="glass border-white/20" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" placeholder="Technical, Leadership…" className="glass border-white/20" />
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
