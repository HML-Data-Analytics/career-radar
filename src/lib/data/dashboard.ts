import { createClient } from "@/lib/supabase/server";

export async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [
    { data: topMatches },
    { data: pendingResumes },
    { data: upcomingApplications },
    { data: careerGaps },
    { data: applicationStats },
    { data: careerProfile },
  ] = await Promise.all([
    supabase
      .from("job_matches")
      .select("id, overall_score, recommendation, job_id, jobs(title, company, location)")
      .eq("user_id", userId)
      .order("overall_score", { ascending: false })
      .limit(5),
    supabase
      .from("resume_versions")
      .select("id, title, state")
      .eq("user_id", userId)
      .eq("state", "GENERATED"),
    supabase
      .from("applications")
      .select("id, status, next_action, next_action_date, jobs(title, company)")
      .eq("user_id", userId)
      .not("next_action_date", "is", null)
      .order("next_action_date", { ascending: true })
      .limit(5),
    supabase
      .from("career_gaps")
      .select("id, requirement, gap_severity, impact")
      .eq("user_id", userId)
      .in("gap_severity", ["medium", "high"])
      .limit(5),
    supabase.from("applications").select("status").eq("user_id", userId),
    supabase
      .from("career_profiles")
      .select("career_direction, career_ambition")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const totalApplications = applicationStats?.length ?? 0;
  const interviews =
    applicationStats?.filter((a) =>
      ["INTERVIEW", "OFFER"].includes(a.status),
    ).length ?? 0;
  const offers =
    applicationStats?.filter((a) => a.status === "OFFER").length ?? 0;

  return {
    topMatches: topMatches ?? [],
    pendingResumeApprovals: pendingResumes?.length ?? 0,
    upcomingApplications: upcomingApplications ?? [],
    careerGaps: careerGaps ?? [],
    applicationPerformance: {
      totalApplications,
      interviews,
      offers,
    },
    careerDirection: careerProfile?.career_direction ?? null,
  };
}
