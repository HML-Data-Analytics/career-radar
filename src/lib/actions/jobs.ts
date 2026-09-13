"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jobPasteSchema } from "@/lib/validations/careerProfile";
import { fetchJobUrlText } from "@/lib/jobs/fetchJobUrl";
import { parseJobDescription } from "@/lib/ai/jobParser";
import { computeJobContentHash } from "@/lib/jobs/contentHash";
import { JOB_PARSER_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { currentModelLabel } from "@/lib/ai/models";
import type { FormActionState } from "@/lib/actions/careerProfile";

export async function submitJobAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = jobPasteSchema.safeParse({
    jobUrl: formData.get("jobUrl") || undefined,
    jobDescription: formData.get("jobDescription") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let rawText: string;
  let jobUrl: string | null = null;

  try {
    if (parsed.data.jobUrl) {
      jobUrl = parsed.data.jobUrl;
      rawText = await fetchJobUrlText(parsed.data.jobUrl);
    } else {
      rawText = parsed.data.jobDescription!;
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to read job posting" };
  }

  let parsedJob;
  try {
    parsedJob = await parseJobDescription(rawText);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not parse this job description. Please check the text and try again.",
    };
  }

  const contentHash = computeJobContentHash({
    title: parsedJob.title,
    company: parsedJob.company,
    location: parsedJob.location,
  });

  // Use the admin client for the shared `jobs` table write (any authenticated
  // user may contribute a deduplicated job record; RLS still applies to all
  // user-scoped tables written below via the regular client).
  const admin = createAdminClient();

  const { data: existingJob } = await admin
    .from("jobs")
    .select("id")
    .eq("content_hash", contentHash)
    .maybeSingle();

  let jobId: string;

  if (existingJob) {
    jobId = existingJob.id;
  } else {
    const { data: inserted, error: insertError } = await admin
      .from("jobs")
      .insert({
        title: parsedJob.title,
        company: parsedJob.company,
        location: parsedJob.location,
        remote_type: parsedJob.remoteType,
        employment_type: parsedJob.employmentType,
        salary_min: parsedJob.salaryMin,
        salary_max: parsedJob.salaryMax,
        currency: parsedJob.currency,
        description: rawText,
        requirements: parsedJob.requirements,
        responsibilities: parsedJob.responsibilities,
        skills: parsedJob.skills,
        technologies: parsedJob.technologies,
        industry: parsedJob.industry,
        seniority: parsedJob.seniority,
        job_url: jobUrl,
        content_hash: contentHash,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return { error: insertError?.message ?? "Failed to save job" };
    }
    jobId = inserted.id;
  }

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    type: "job_parser",
    model: currentModelLabel(),
    prompt_version: JOB_PARSER_PROMPT_VERSION,
    input_reference: { jobUrl },
    output: parsedJob,
  });

  await supabase.from("saved_jobs").upsert(
    { user_id: user.id, job_id: jobId },
    { onConflict: "user_id,job_id" },
  );

  redirect(`/jobs/${jobId}`);
}
