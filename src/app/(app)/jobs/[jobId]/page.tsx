import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyzeJobButton } from "@/components/jobs/analyze-job-button";
import { AddToPipelineButton } from "@/components/applications/add-to-pipeline-button";

export default async function JobDetailPage({
  params,
}: PageProps<"/jobs/[jobId]">) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  const { data: match } = await supabase
    .from("job_matches")
    .select("*")
    .eq("user_id", user!.id)
    .eq("job_id", jobId)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel flex flex-col gap-2 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {job.title}
            </h1>
            <p className="text-muted-foreground">
              {job.company}
              {job.location ? ` · ${job.location}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {job.job_url ? (
              <a
                href={job.job_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline underline-offset-4"
              >
                View original posting
              </a>
            ) : null}
            <AddToPipelineButton jobId={jobId} />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {job.seniority ? <Badge variant="secondary">{job.seniority}</Badge> : null}
          {job.remote_type ? <Badge variant="secondary">{job.remote_type}</Badge> : null}
          {job.employment_type ? <Badge variant="secondary">{job.employment_type}</Badge> : null}
          {job.industry ? <Badge variant="secondary">{job.industry}</Badge> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job description</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
            {job.description}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Should I apply?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {match ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall match</span>
                  <Badge>{match.overall_score}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Qualification</span>
                  <span className="text-sm">{match.qualification_score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Career fit</span>
                  <span className="text-sm">{match.career_fit_score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Opportunity quality</span>
                  <span className="text-sm">{match.opportunity_quality_score}</span>
                </div>
                <p className="text-sm">
                  Recommendation: <span className="font-medium">{match.recommendation}</span>
                </p>
                {match.reasoning ? (
                  <p className="text-sm text-muted-foreground">{match.reasoning}</p>
                ) : null}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Not analyzed yet. Run the matching engine to see your qualification, career fit, and opportunity quality scores.
                </p>
                <AnalyzeJobButton jobId={jobId} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
