import { createClient } from "@/lib/supabase/server";
import { CareerPreferencesForm } from "@/components/career-preferences-form";

export default async function PreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: prefs } = await supabase
    .from("career_preferences")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Preferences
        </h1>
        <p className="text-muted-foreground">
          These drive matching, filtering, and the &quot;Should I Apply?&quot; recommendation. Nothing here is hard-coded — it&apos;s all yours to configure.
        </p>
      </div>
      <CareerPreferencesForm prefs={prefs ?? null} />
    </div>
  );
}
