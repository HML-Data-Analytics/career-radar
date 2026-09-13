import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { CircleCheck, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type SetupProgress = {
  hasCareerProfile: boolean;
  hasExperience: boolean;
  hasResume: boolean;
  hasPreferences: boolean;
  hasAnalyzedJob: boolean;
};

const STEPS: {
  key: keyof SetupProgress;
  label: string;
  href: string;
}[] = [
  { key: "hasResume", label: "Upload a resume", href: "/resumes" },
  { key: "hasCareerProfile", label: "Complete your Career Profile", href: "/career-profile" },
  { key: "hasExperience", label: "Add experience to your Career DNA", href: "/career-dna" },
  { key: "hasPreferences", label: "Set your job preferences", href: "/preferences" },
  { key: "hasAnalyzedJob", label: "Analyze your first job", href: "/jobs" },
];

export function SetupChecklist({ progress }: { progress: SetupProgress }) {
  const completed = STEPS.filter((step) => progress[step.key]).length;
  if (completed === STEPS.length) return null;

  const percent = Math.round((completed / STEPS.length) * 100);

  return (
    <div className="glass-panel flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <p className="font-medium">Finish setting up Career Radar</p>
        <span className="text-sm text-muted-foreground">
          {completed}/{STEPS.length}
        </span>
      </div>
      <Progress value={percent} className="h-1.5" />
      <ul className="flex flex-col gap-1">
        {STEPS.map((step) => {
          const done = progress[step.key];
          return (
            <li key={step.key}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-white/10",
                  done ? "text-muted-foreground line-through" : "text-foreground",
                )}
              >
                {done ? (
                  <CircleCheck className="size-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="size-4 shrink-0 text-muted-foreground" />
                )}
                {step.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
