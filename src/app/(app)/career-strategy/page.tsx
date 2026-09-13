import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { CareerProgressionChart } from "@/components/career-strategy/career-progression-chart";
import { OpportunityComparisonTable } from "@/components/career-strategy/opportunity-comparison-table";
import { RecurringGapsList } from "@/components/career-strategy/recurring-gaps-list";

export default async function CareerStrategyPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const [{ data: matchesRaw }, { data: gapsRaw }] = await Promise.all([
    supabase
      .from("job_matches")
      .select(
        "job_id, overall_score, recommendation, career_progression, should_apply, created_at, jobs(id, title, company)",
      )
      .eq("user_id", user!.id)
      .order("overall_score", { ascending: false }),
    supabase
      .from("career_gaps")
      .select("requirement, gap_severity, impact")
      .eq("user_id", user!.id),
  ]);

  const matches = (matchesRaw ?? []).map((m) => {
    const job = Array.isArray(m.jobs) ? m.jobs[0] : m.jobs;
    return { ...m, job };
  });

  if (matches.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <EmptyState
          title="No analyzed jobs yet"
          description="Open a saved job and run an AI match analysis. Once you've analyzed a few jobs, this page compares them side by side and surfaces patterns - recurring skill gaps, and whether the roles you're pursuing tend to be promotions, lateral moves, or pivots."
          href="/jobs"
          cta="Go to Jobs"
        />
      </div>
    );
  }

  const progressionCounts: Record<string, number> = {};
  for (const m of matches) {
    const key = m.career_progression ?? "unclear";
    progressionCounts[key] = (progressionCounts[key] ?? 0) + 1;
  }

  const gapCounts = new Map<string, { count: number; severity: string | null }>();
  for (const g of gapsRaw ?? []) {
    const existing = gapCounts.get(g.requirement);
    if (existing) {
      existing.count += 1;
    } else {
      gapCounts.set(g.requirement, { count: 1, severity: g.gap_severity });
    }
  }
  const recurringGaps = [...gapCounts.entries()]
    .map(([requirement, data]) => ({ requirement, ...data }))
    .filter((g) => g.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const shouldApplyCount = matches.filter((m) => m.should_apply).length;

  return (
    <div className="flex flex-col gap-6">
      <Header />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Jobs analyzed" value={matches.length} />
        <Stat label="Should apply" value={shouldApplyCount} />
        <Stat
          label="Avg. match score"
          value={Math.round(
            matches.reduce((sum, m) => sum + (m.overall_score ?? 0), 0) / matches.length,
          )}
        />
        <Stat label="Recurring gaps" value={recurringGaps.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Career progression across analyzed jobs</CardTitle>
          <CardDescription>
            How the roles you&apos;ve analyzed compare to your current position, per the AI&apos;s assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CareerProgressionChart counts={progressionCounts} total={matches.length} />
        </CardContent>
      </Card>

      {recurringGaps.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recurring gaps</CardTitle>
            <CardDescription>
              Requirements that came up as a gap across more than one analyzed job - the strongest signal for what to invest in next.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecurringGapsList gaps={recurringGaps} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Opportunity comparison</CardTitle>
          <CardDescription>Every analyzed job, ranked by overall match score.</CardDescription>
        </CardHeader>
        <CardContent>
          <OpportunityComparisonTable matches={matches} />
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Career Strategy</h1>
      <p className="text-muted-foreground">
        Career progression analysis, opportunity comparison, and patterns across every job you&apos;ve had the AI analyze.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel flex flex-col gap-1 p-5">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
