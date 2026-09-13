import { Progress } from "@/components/ui/progress";

const LABELS: Record<string, string> = {
  promotion: "Promotion",
  lateral_move: "Lateral move",
  strategic_pivot: "Strategic pivot",
  downgrade: "Downgrade",
  temporary_step: "Temporary step",
  unclear: "Unclear",
};

const ORDER = [
  "promotion",
  "lateral_move",
  "strategic_pivot",
  "temporary_step",
  "downgrade",
  "unclear",
];

export function CareerProgressionChart({
  counts,
  total,
}: {
  counts: Record<string, number>;
  total: number;
}) {
  const rows = ORDER.filter((key) => counts[key] > 0);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((key) => {
        const count = counts[key];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span>{LABELS[key] ?? key}</span>
              <span className="text-muted-foreground">
                {count} ({pct}%)
              </span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      })}
    </div>
  );
}
