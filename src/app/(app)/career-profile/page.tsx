import { createClient } from "@/lib/supabase/server";
import { CareerProfileForm } from "@/components/career-profile-form";

export default async function CareerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("career_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Career Profile
        </h1>
        <p className="text-muted-foreground">
          This forms the foundation of your Career DNA — used across matching, gap analysis, and resume tailoring.
        </p>
      </div>
      <CareerProfileForm profile={profile ?? null} />
    </div>
  );
}
