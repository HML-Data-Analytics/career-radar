import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TailoredResumeActions } from "@/components/resumes/tailored-resume-actions";
import type {
  TailoredResumeContent,
  ResumeTailorResult,
} from "@/lib/validations/resumeTailor";
import type { ResumeQualityScore } from "@/lib/validations/resumeQuality";

type StoredContent = {
  tailored: TailoredResumeContent;
  changesSummary: ResumeTailorResult["changesSummary"];
  potentialConcerns: string[];
  unsupportedRequirementsNotAdded: ResumeTailorResult["unsupportedRequirementsNotAdded"];
};

export default async function TailoredResumePage({
  params,
}: PageProps<"/resumes/tailored/[versionId]">) {
  const { versionId } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: version } = await supabase
    .from("resume_versions")
    .select("*, master_resumes(title, raw_text), jobs(title, company)")
    .eq("id", versionId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!version) {
    notFound();
  }

  const content = version.content as StoredContent | null;
  const tailored = content?.tailored;
  const quality = version.quality_scores as ResumeQualityScore | null;
  const masterResume = Array.isArray(version.master_resumes)
    ? version.master_resumes[0]
    : version.master_resumes;
  const job = Array.isArray(version.jobs) ? version.jobs[0] : version.jobs;

  if (!tailored) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel flex flex-col gap-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {version.title}
            </h1>
            <p className="text-muted-foreground">
              {job ? `Tailored for ${job.title} at ${job.company}` : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={version.state === "APPROVED" ? "default" : "secondary"}>
              {version.state}
            </Badge>
            {version.tailoring_intensity ? (
              <Badge variant="outline">{version.tailoring_intensity}</Badge>
            ) : null}
          </div>
        </div>
        <TailoredResumeActions versionId={versionId} state={version.state} />
      </div>

      {content?.unsupportedRequirementsNotAdded && content.unsupportedRequirementsNotAdded.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Requirements not added (no verified evidence)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {content.unsupportedRequirementsNotAdded.map((item) => (
              <div key={item.requirement} className="glass rounded-xl p-3">
                <p className="text-sm font-medium">{item.requirement}</p>
                <p className="text-sm text-muted-foreground">{item.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Master resume</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
            {masterResume?.raw_text ?? "Not available"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tailored resume</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div>
              <p className="font-medium">{tailored.headline}</p>
              <p className="mt-1 text-muted-foreground">{tailored.professionalSummary}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tailored.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {tailored.experiences.map((exp) => (
                <div key={`${exp.company}-${exp.title}`} className="glass rounded-xl p-3">
                  <p className="font-medium">
                    {exp.title} - {exp.company}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate ?? "?"} - {exp.isCurrent ? "Present" : exp.endDate ?? "?"}
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 text-muted-foreground">
                    {exp.bullets.map((bullet) => (
                      <li key={bullet}>- {bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {content?.changesSummary && content.changesSummary.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Changes made</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {content.changesSummary.map((change) => (
              <div key={change.description} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="shrink-0 text-xs capitalize">
                  {change.type}
                </Badge>
                <span className="text-muted-foreground">{change.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {content?.potentialConcerns && content.potentialConcerns.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Potential concerns</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
            {content.potentialConcerns.map((concern) => (
              <p key={concern}>- {concern}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {quality ? (
        <Card>
          <CardHeader>
            <CardTitle>Resume Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall</span>
              <Badge>{quality.overall}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  ["atsCompatibility", "ATS Compatibility"],
                  ["impact", "Impact"],
                  ["clarity", "Clarity"],
                  ["keywordCoverage", "Keyword Coverage"],
                  ["leadershipPositioning", "Leadership Positioning"],
                  ["quantification", "Quantification"],
                  ["readability", "Readability"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{label}</span>
                    <span>{quality[key]}</span>
                  </div>
                  <Progress value={quality[key]} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
