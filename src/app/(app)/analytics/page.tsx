import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("status, created_at")
    .eq("user_id", user!.id);

  const total = applications?.length ?? 0;
  const interviews =
    applications?.filter((a) => ["INTERVIEW", "OFFER"].includes(a.status)).length ?? 0;
  const offers = applications?.filter((a) => a.status === "OFFER").length ?? 0;
  const rejected = applications?.filter((a) => a.status === "REJECTED").length ?? 0;

  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Outcomes from your own application history. Patterns and conversion-by-match-score breakdowns appear once you have enough applications tracked.
        </p>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No application data yet"
          description="Once you start tracking applications, your response rate, interview rate, and patterns will show up here."
          href="/applications"
          cta="Go to Applications"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Applications" value={total} />
          <Stat label="Interviews" value={interviews} />
          <Stat label="Offers" value={offers} />
          <Stat label="Rejected" value={rejected} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Interview rate</CardTitle>
          <CardDescription>Share of applications that reached an interview or later.</CardDescription>
        </CardHeader>
        <CardContent>
          {interviewRate === null ? (
            <p className="text-sm text-muted-foreground">Not enough data yet.</p>
          ) : (
            <p className="text-3xl font-semibold">{interviewRate}%</p>
          )}
        </CardContent>
      </Card>
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
