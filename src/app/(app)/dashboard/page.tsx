import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getDashboardData } from "@/lib/data/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { Flame, Sparkles, CalendarClock, TriangleAlert } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const data = await getDashboardData(user!.id);

  const highPriorityCount = data.topMatches.filter(
    (m) => (m.overall_score ?? 0) >= 80,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Career Radar
        </h1>
        <p className="mt-1 text-muted-foreground">
          {highPriorityCount > 0
            ? `You have ${highPriorityCount} high-priority ${highPriorityCount === 1 ? "opportunity" : "opportunities"} today.`
            : "No high-priority opportunities yet - paste a job description to get your first match."}
          {data.pendingResumeApprovals > 0
            ? ` ${data.pendingResumeApprovals} ${data.pendingResumeApprovals === 1 ? "resume needs" : "resumes need"} approval.`
            : ""}
        </p>
        {data.careerDirection ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Your current career direction:{" "}
            <span className="text-foreground">{data.careerDirection}</span>
          </p>
        ) : null}
      </div>

      <SetupChecklist progress={data.setupProgress} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-4 text-primary" /> Today&apos;s Opportunities
            </CardTitle>
            <CardDescription>
              Your best-ranked jobs, prioritized so you don&apos;t have to sift through hundreds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topMatches.length === 0 ? (
              <EmptyState
                title="No opportunities yet"
                description="Paste a job URL or description under Jobs to get your first match score."
                href="/jobs"
                cta="Add a job"
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {data.topMatches.map((match) => {
                  const job = Array.isArray(match.jobs) ? match.jobs[0] : match.jobs;
                  return (
                    <li
                      key={match.id}
                      className="glass flex items-center justify-between rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{job?.title ?? "Untitled role"}</p>
                        <p className="text-sm text-muted-foreground">
                          {job?.company}
                          {job?.location ? ` · ${job.location}` : ""}
                        </p>
                      </div>
                      <Badge variant={(match.overall_score ?? 0) >= 80 ? "default" : "secondary"}>
                        {match.overall_score ?? "-"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" /> Needs Action
            </CardTitle>
            <CardDescription>Applications with an upcoming next step.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.upcomingApplications.length === 0 ? (
              <EmptyState
                title="Nothing due"
                description="Application next-actions will show up here."
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {data.upcomingApplications.map((app) => {
                  const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
                  return (
                    <li key={app.id} className="glass rounded-xl px-4 py-3 text-sm">
                      <p className="font-medium">{job?.title}</p>
                      <p className="text-muted-foreground">{app.next_action}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="size-4 text-primary" /> Top Career Gaps
            </CardTitle>
            <CardDescription>Skills worth developing next.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.careerGaps.length === 0 ? (
              <EmptyState
                title="No gaps identified"
                description="Gaps appear once we analyze a job against your Career DNA."
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {data.careerGaps.map((gap) => (
                  <li key={gap.id} className="glass flex items-center justify-between rounded-xl px-4 py-3 text-sm">
                    <span>{gap.requirement}</span>
                    <Badge variant="outline">{gap.gap_severity}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Application Performance
            </CardTitle>
            <CardDescription>Outcomes across all your applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold">
                  {data.applicationPerformance.totalApplications}
                </p>
                <p className="text-xs text-muted-foreground">Applications</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {data.applicationPerformance.interviews}
                </p>
                <p className="text-xs text-muted-foreground">Interviews</p>
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {data.applicationPerformance.offers}
                </p>
                <p className="text-xs text-muted-foreground">Offers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
