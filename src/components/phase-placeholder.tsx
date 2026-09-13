import { Construction } from "lucide-react";

export function PhasePlaceholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="glass-panel flex flex-col items-center gap-3 p-10 text-center">
        <div className="glass flex size-12 items-center justify-center rounded-2xl text-primary">
          <Construction className="size-5" />
        </div>
        <p className="font-medium">Coming in {phase}</p>
        <p className="max-w-md text-sm text-muted-foreground">
          This area is part of the Career Radar roadmap but hasn&apos;t been built yet. It will appear here once that phase ships - nothing here is a stand-in for a finished feature.
        </p>
      </div>
    </div>
  );
}
