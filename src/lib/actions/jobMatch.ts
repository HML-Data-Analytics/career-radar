"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { analyzeJobMatch } from "@/lib/ai/jobMatcher";
import { JOB_MATCHER_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export async function analyzeJobMatchAction(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const [
    { data: job },
    { data: careerProfile },
    { data: experiences },
    { data: skills },
    { data: evidence },
    { data: preferences },
  ] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", jobId).maybeSingle(),
    supabase.from("career_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("career_experiences").select("*").eq("user_id", user.id),
    supabase.from("career_skills").select("*").eq("user_id", user.id),
    supabase.from("career_evidence").select("*").eq("user_id", user.id).eq("verified", true),
    supabase.from("career_preferences").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!job) {
    return { error: "Job not found" };
  }

  if (!careerProfile) {
    return { error: "Complete your Career Profile before running a match." };
  }

  let result;
  try {
    result = await analyzeJobMatch({
      careerProfile,
      experiences: experiences ?? [],
      skills: skills ?? [],
      evidence: evidence ?? [],
      preferences: preferences ?? {},
      job,
    });
  } catch {
    return { error: "Failed to analyze this job. Please try again." };
  }

  const { error: upsertError } = await supabase.from("job_matches").upsert(
    {
      user_id: user.id,
      job_id: jobId,
      overall_score: result.overallScore,
      qualification_score: result.qualificationScore,
      career_fit_score: result.careerFitScore,
      opportunity_quality_score: result.opportunityQualityScore,
      dimension_scores: result.scores,
      recommendation: result.recommendation,
      career_progression: result.careerProgression,
      strengths: result.strengths,
      gaps: result.gaps,
      transferable_experience: result.transferableExperience,
      reasoning: result.reasoning,
      should_apply: result.shouldApply,
      should_apply_reasons: result.shouldApplyReasons,
      prompt_version: JOB_MATCHER_PROMPT_VERSION,
      model: DEFAULT_MODEL,
    },
    { onConflict: "user_id,job_id" },
  );

  if (upsertError) {
    return { error: upsertError.message };
  }

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    type: "job_matcher",
    model: DEFAULT_MODEL,
    prompt_version: JOB_MATCHER_PROMPT_VERSION,
    input_reference: { jobId },
    output: result,
  });

  if (result.gaps.length > 0) {
    await supabase.from("career_gaps").insert(
      result.gaps.map((gap) => ({
        user_id: user.id,
        job_id: jobId,
        requirement: gap,
        gap_severity: "medium" as const,
        impact: "medium" as const,
      })),
    );
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
  revalidatePath("/dashboard");

  return { success: true };
}
