import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ResumeUploadForm } from "@/components/resumes/resume-upload-form";
import { ResumeCard } from "@/components/resumes/resume-card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export default async function ResumesPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const [{ data: resumes }, { data: tailoredVersions }] = await Promise.all([
    supabase
      .from("master_resumes")
      .select("id, title, file_type, is_active, created_at, parsed_content")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("resume_versions")
      .select("id, title, state, created_at, jobs(title, company)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Resumes</h1>
        <p className="text-muted-foreground">
          Upload your resume, parse it into your Career DNA, and check its quality. Tailor it for a specific job from that job&apos;s page.
        </p>
      </div>

      <ResumeUploadForm />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Your resumes
        </h2>
        {!resumes || resumes.length === 0 ? (
          <EmptyState
            title="No resumes uploaded yet"
            description="Upload a PDF or DOCX resume above to get started."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </div>

      {tailoredVersions && tailoredVersions.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Tailored versions
          </h2>
          <ul className="flex flex-col gap-2">
            {tailoredVersions.map((version) => {
              const job = Array.isArray(version.jobs) ? version.jobs[0] : version.jobs;
              return (
                <li key={version.id}>
                  <Link
                    href={`/resumes/tailored/${version.id}`}
                    className="glass flex flex-col gap-1 rounded-xl p-4 transition-colors hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{version.title}</p>
                      {job ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {job.title} at {job.company}
                        </p>
                      ) : null}
                    </div>
                    <Badge
                      variant={version.state === "APPROVED" ? "default" : "secondary"}
                      className="w-fit shrink-0"
                    >
                      {version.state}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
