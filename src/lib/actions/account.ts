"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Deletes all of the user's owned records and their auth account. Job
 * postings and company/job intelligence are shared reference data and are
 * intentionally left in place - only this user's link to them is removed.
 */
export async function deleteAccountAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  // Deleting the auth user cascades to every table with
  // `user_id references auth.users(id) on delete cascade`.
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}
