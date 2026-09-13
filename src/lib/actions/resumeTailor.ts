"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tailorResume } from "@/lib/ai/resumeTailor";
import { analyzeResumeQuality } from "@/lib/ai/resumeQualityAnalyzer";
import { RESUME_TAILOR_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { currentModelLabel } from "@/lib/ai/models";
import { tailoringIntensityEnum, type TailoringIntensity } from "@/lib/validations/resumeTailor";
import type { TailoredResumeContent } from "@/lib/validations/resumeTailor";

export async function generateTailoredResumeAction(params: {
  jobId: string;
  masterResumeId: string;
  intensity: TailoringIntensity;
}) {
  const parsedIntensity = tailoringIntensityEnum.safeParse(params.intensity);
  if (!parsedIntensity.success) {
    return { error: "Invalid tailoring intensity" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const [
    { data: job },
    { data: masterResume },
    { data: careerProfile },
    { data: experiences },
    { data: skills },
    { data: evidence },
  ] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", params.jobId).maybeSingle(),
    supabase
      .from("master_resumes")
      .select("id, title, raw_text")
      .eq("id", params.masterResumeId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("career_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("career_experiences").select("*").eq("user_id", user.id),
    supabase.from("career_skills").select("*").eq("user_id", user.id),
    supabase.from("career_evidence").select("*").eq("user_id", user.id).eq("verified", true),
  ]);

  if (!job) return { error: "Job not found" };
  if (!masterResume?.raw_text) return { error: "Master resume not found or has no extracted text" };
  if (!careerProfile) return { error: "Complete your Career Profile before tailoring a resume." };

  let result;
  try {
    result = await tailorResume({
      intensity: parsedIntensity.data,
      careerProfile,
      experiences: experiences ?? [],
      skills: skills ?? [],
      evidence: evidence ?? [],
      masterResumeText: masterResume.raw_text,
      job,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to tailor resume" };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("resume_versions")
    .insert({
      user_id: user.id,
      master_resume_id: params.masterResumeId,
      job_id: params.jobId,
      title: `${masterResume.title} - tailored for ${job.title} at ${job.company}`,
      state: "GENERATED",
      tailoring_intensity: parsedIntensity.data,
      content: {
        tailored: result.content,
        changesSummary: result.changesSummary,
        potentialConcerns: result.potentialConcerns,
        unsupportedRequirementsNotAdded: result.unsupportedRequirementsNotAdded,
      },
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: insertError?.message ?? "Failed to save tailored resume" };
  }

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    type: "resume_tailor",
    model: currentModelLabel(),
    prompt_version: RESUME_TAILOR_PROMPT_VERSION,
    input_reference: { jobId: params.jobId, masterResumeId: params.masterResumeId, intensity: parsedIntensity.data },
    output: result,
  });

  revalidatePath(`/resumes/${inserted.id}`);
  revalidatePath("/resumes");
  revalidatePath(`/jobs/${params.jobId}`);

  return { success: true, resumeVersionId: inserted.id as string };
}

export async function updateTailoredResumeContentAction(
  versionId: string,
  content: TailoredResumeContent,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("resume_versions")
    .select("content")
    .eq("id", versionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) return { error: "Resume version not found" };

  const existingContent = (existing.content as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from("resume_versions")
    .update({
      content: { ...existingContent, tailored: content },
      state: "USER_EDITED",
    })
    .eq("id", versionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/resumes/${versionId}`);
  return { success: true };
}

export async function approveTailoredResumeAction(versionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("resume_versions")
    .update({ state: "APPROVED" })
    .eq("id", versionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/resumes/${versionId}`);
  return { success: true };
}

export async function scoreTailoredResumeQualityAction(versionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: version } = await supabase
    .from("resume_versions")
    .select("content")
    .eq("id", versionId)
    .eq("user_id", user.id)
    .maybeSingle();

  const tailored = (version?.content as { tailored?: TailoredResumeContent } | null)?.tailored;
  if (!tailored) return { error: "No tailored content to score" };

  const asText = [
    tailored.headline,
    tailored.professionalSummary,
    `Skills: ${tailored.skills.join(", ")}`,
    ...tailored.experiences.map(
      (exp) =>
        `${exp.title} at ${exp.company}\n${exp.bullets.join("\n")}`,
    ),
  ].join("\n\n");

  let quality;
  try {
    quality = await analyzeResumeQuality(asText);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to score resume quality" };
  }

  const existingContent = (version!.content as Record<string, unknown>) ?? {};

  const { error } = await supabase
    .from("resume_versions")
    .update({ quality_scores: quality, content: existingContent })
    .eq("id", versionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/resumes/${versionId}`);
  return { success: true };
}

export async function deleteResumeVersionAction(versionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("resume_versions").delete().eq("id", versionId).eq("user_id", user.id);
  revalidatePath("/resumes");
}
