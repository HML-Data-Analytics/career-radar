import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatusSelect } from "@/components/applications/status-select";
import { ApplicationDetailTabs } from "@/components/applications/application-detail-tabs";

export default async function ApplicationDetailPage({
  params,
}: PageProps<"/applications/[applicationId]">) {
  const { applicationId } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("*, jobs(title, company, location)")
    .eq("id", applicationId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!application) {
    notFound();
  }

  const job = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs;

  const [
    { data: applicationPackage },
    { data: answers },
    { data: interviewPrep },
  ] = await Promise.all([
    supabase
      .from("application_packages")
      .select("*")
      .eq("application_id", applicationId)
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("application_answers")
      .select("*")
      .eq("application_id", applicationId)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("interview_preparation")
      .select("*")
      .eq("application_id", applicationId)
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel flex flex-col gap-2 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {job?.title ?? "Application"}
            </h1>
            <p className="text-muted-foreground">
              {job?.company}
              {job?.location ? ` · ${job.location}` : ""}
            </p>
          </div>
          <Badge>{application.status}</Badge>
        </div>
        <div className="mt-2">
          <ApplicationStatusSelect applicationId={applicationId} status={application.status} />
        </div>
      </div>

      <ApplicationDetailTabs
        applicationId={applicationId}
        applicationPackage={applicationPackage ?? null}
        answers={answers ?? []}
        interviewPrep={interviewPrep ?? null}
      />
    </div>
  );
}
