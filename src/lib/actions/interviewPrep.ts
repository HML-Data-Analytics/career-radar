"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { generateInterviewPrep } from "@/lib/ai/interviewPrep";
import { INTERVIEW_PREP_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { currentModelLabel } from "@/lib/ai/models";

export async function generateInterviewPrepAction(applicationId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("id, jobs(*)")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!application) return { error: "Application not found" };
  const job = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs;
  if (!job) return { error: "Job not found for this application" };

  const [
    { data: careerProfile },
    { data: experiences },
    { data: skills },
    { data: evidence },
  ] = await Promise.all([
    supabase.from("career_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("career_experiences").select("*").eq("user_id", user.id),
    supabase.from("career_skills").select("*").eq("user_id", user.id),
    supabase.from("career_evidence").select("*").eq("user_id", user.id).eq("verified", true),
  ]);

  if (!careerProfile) {
    return { error: "Complete your Career Profile before generating interview prep." };
  }

  let result;
  try {
    result = await generateInterviewPrep({
      careerProfile,
      experiences: experiences ?? [],
      skills: skills ?? [],
      evidence: evidence ?? [],
      job,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate interview prep" };
  }

  const { error } = await supabase.from("interview_preparation").upsert(
    {
      user_id: user.id,
      application_id: applicationId,
      likely_questions: result.likelyQuestions,
      technical_questions: result.technicalQuestions,
      leadership_questions: result.leadershipQuestions,
      behavioral_questions: result.behavioralQuestions,
      company_specific_questions: result.companySpecificQuestions,
      jd_specific_questions: result.jdSpecificQuestions,
      potential_concerns: result.potentialConcerns,
      recommended_stories: result.recommendedStories,
      prompt_version: INTERVIEW_PREP_PROMPT_VERSION,
      model: currentModelLabel(),
    },
    { onConflict: "application_id" },
  );

  if (error) return { error: error.message };

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    type: "interview_prep",
    model: currentModelLabel(),
    prompt_version: INTERVIEW_PREP_PROMPT_VERSION,
    input_reference: { applicationId },
    output: result,
  });

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/interview-prep");
  return { success: true };
}
