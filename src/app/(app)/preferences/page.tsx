import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { CareerPreferencesForm } from "@/components/career-preferences-form";
import { PreferencesChecklist } from "@/components/preferences/preferences-checklist";
import { PreferenceSuggestionsPanel } from "@/components/preferences/preference-suggestions-panel";
import { ClearPreferencesButton } from "@/components/preferences/clear-preferences-button";
import { clearCareerPreferencesAction } from "@/lib/actions/careerPreferences";

export default async function PreferencesPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: prefs } = await supabase
    .from("career_preferences")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Preferences
          </h1>
          <p className="text-muted-foreground">
            These drive matching, filtering, and the &quot;Should I Apply?&quot; recommendation. Nothing here is hard-coded - it&apos;s all yours to configure.
          </p>
        </div>
        {prefs ? (
          <ClearPreferencesButton onConfirm={clearCareerPreferencesAction} />
        ) : null}
      </div>
      <PreferencesChecklist prefs={prefs ?? null} />
      <PreferenceSuggestionsPanel />
      <CareerPreferencesForm prefs={prefs ?? null} />
    </div>
  );
}
