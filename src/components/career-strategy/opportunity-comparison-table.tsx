import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const PROGRESSION_LABELS: Record<string, string> = {
  promotion: "Promotion",
  lateral_move: "Lateral move",
  strategic_pivot: "Strategic pivot",
  downgrade: "Downgrade",
  temporary_step: "Temporary step",
  unclear: "Unclear",
};

const RECOMMENDATION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  STRONGLY_RECOMMEND: "default",
  RECOMMEND: "default",
  CONSIDER: "secondary",
  WEAK_MATCH: "outline",
  NOT_RECOMMENDED: "destructive",
};

type MatchRow = {
  job_id: string;
  overall_score: number | null;
  recommendation: string | null;
  career_progression: string | null;
  should_apply: boolean | null;
  job: { id: string; title: string; company: string } | null | undefined;
};

export function OpportunityComparisonTable({ matches }: { matches: MatchRow[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {matches.map((m) => (
        <li key={m.job_id}>
          <Link
            href={`/jobs/${m.job_id}`}
            className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-white/10"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{m.job?.title ?? "Untitled role"}</p>
              <p className="truncate text-sm text-muted-foreground">{m.job?.company}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {m.career_progression ? (
                <Badge variant="outline" className="text-xs">
                  {PROGRESSION_LABELS[m.career_progression] ?? m.career_progression}
                </Badge>
              ) : null}
              {m.recommendation ? (
                <Badge
                  variant={RECOMMENDATION_VARIANT[m.recommendation] ?? "outline"}
                  className="text-xs capitalize"
                >
                  {m.recommendation.replace(/_/g, " ").toLowerCase()}
                </Badge>
              ) : null}
              <Badge className="text-xs">{m.overall_score ?? "-"}</Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
