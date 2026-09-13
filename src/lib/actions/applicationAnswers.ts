"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { generateApplicationAnswer } from "@/lib/ai/applicationAnswer";
import { APPLICATION_ANSWER_PROMPT_VERSION } from "@/lib/ai/promptVersions";
import { currentModelLabel } from "@/lib/ai/models";
import type { FormActionState } from "@/lib/actions/careerProfile";

export async function generateApplicationAnswerAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const applicationId = formData.get("applicationId");
  const question = formData.get("question");
  if (typeof applicationId !== "string" || !applicationId) {
    return { error: "Missing application" };
  }
  if (typeof question !== "string" || !question.trim()) {
    return { error: "Enter a question" };
  }

  const supabase = await createClient();

  const { data: application } = await supabase
    .from("applications")
    .select("id, jobs(*)")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!application) return { error: "Application not found" };
  const job = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs;

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
    return { error: "Complete your Career Profile before generating answers." };
  }

  let result;
  try {
    result = await generateApplicationAnswer({
      question: question.trim(),
      careerProfile,
      experiences: experiences ?? [],
      skills: skills ?? [],
      evidence: evidence ?? [],
      job: job ?? null,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to generate an answer" };
  }

  const { error } = await supabase.from("application_answers").insert({
    user_id: user.id,
    application_id: applicationId,
    question: question.trim(),
    answer: result.gapsNote ? `${result.answer}\n\n(${result.gapsNote})` : result.answer,
    status: "draft",
    prompt_version: APPLICATION_ANSWER_PROMPT_VERSION,
    model: currentModelLabel(),
  });

  if (error) return { error: error.message };

  await supabase.from("ai_generations").insert({
    user_id: user.id,
    type: "application_answer",
    model: currentModelLabel(),
    prompt_version: APPLICATION_ANSWER_PROMPT_VERSION,
    input_reference: { applicationId, question: question.trim() },
    output: result,
  });

  revalidatePath(`/applications/${applicationId}`);
  return { success: true };
}

export async function updateApplicationAnswerAction(answerId: string, answer: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("application_answers")
    .update({ answer, status: "edited" })
    .eq("id", answerId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function setApplicationAnswerStatusAction(
  answerId: string,
  status: "approved" | "rejected",
) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase
    .from("application_answers")
    .update({ status })
    .eq("id", answerId)
    .eq("user_id", user.id);
}

export async function deleteApplicationAnswerAction(answerId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("application_answers").delete().eq("id", answerId).eq("user_id", user.id);
}
