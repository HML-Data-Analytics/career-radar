"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ApplicationStatus =
  | "DISCOVERED"
  | "SAVED"
  | "REVIEWING"
  | "RESUME_TAILORED"
  | "RESUME_APPROVED"
  | "READY_TO_APPLY"
  | "APPLIED"
  | "RECRUITER_CONTACT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export async function updateApplicationStatusAction(
  applicationId: string,
  status: ApplicationStatus,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: current } = await supabase
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("applications")
    .update({ status, applied_at: status === "APPLIED" ? new Date().toISOString() : undefined })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  await supabase.from("application_events").insert({
    user_id: user.id,
    application_id: applicationId,
    event_type: "status_change",
    from_status: current?.status ?? null,
    to_status: status,
  });

  revalidatePath("/applications");
  return { success: true };
}

export async function createApplicationFromJobAction(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("applications").upsert(
    {
      user_id: user.id,
      job_id: jobId,
      status: "REVIEWING",
    },
    { onConflict: "user_id,job_id", ignoreDuplicates: true },
  );

  if (error) return { error: error.message };

  revalidatePath("/applications");
  return { success: true };
}
