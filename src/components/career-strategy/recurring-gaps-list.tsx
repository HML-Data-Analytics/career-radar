import { Badge } from "@/components/ui/badge";

const SEVERITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export function RecurringGapsList({
  gaps,
}: {
  gaps: { requirement: string; count: number; severity: string | null }[];
}) {
  return (
    <ul className="flex flex-col gap-2">
      {gaps.map((gap) => (
        <li
          key={gap.requirement}
          className="glass flex items-center justify-between gap-3 rounded-xl p-3"
        >
          <span className="text-sm font-medium">{gap.requirement}</span>
          <div className="flex shrink-0 items-center gap-2">
            {gap.severity ? (
              <Badge variant={SEVERITY_VARIANT[gap.severity] ?? "outline"} className="text-xs capitalize">
                {gap.severity}
              </Badge>
            ) : null}
            <Badge variant="outline" className="text-xs">
              {gap.count} jobs
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}
