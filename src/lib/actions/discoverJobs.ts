"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

/** Saves a job that's already in the `jobs` table (populated by the daily
 * source refresh, see /api/cron/refresh-jobs) to the current user's list. */
export async function saveJobAction(jobId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_jobs")
    .upsert({ user_id: user.id, job_id: jobId }, { onConflict: "user_id,job_id" });

  if (error) return { error: error.message };
  return { success: true };
}
