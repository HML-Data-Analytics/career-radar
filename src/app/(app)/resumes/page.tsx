import { createClient } from "@/lib/supabase/server";
import { ResumeUploadForm } from "@/components/resumes/resume-upload-form";
import { ResumeCard } from "@/components/resumes/resume-card";
import { EmptyState } from "@/components/empty-state";

export default async function ResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: resumes } = await supabase
    .from("master_resumes")
    .select("id, title, file_type, is_active, created_at, parsed_content")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Resumes</h1>
        <p className="text-muted-foreground">
          Upload your resume, parse it into your Career DNA, and check its quality. Tailored per-job versions come in a later phase - this is your Master Resume.
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
    </div>
  );
}
