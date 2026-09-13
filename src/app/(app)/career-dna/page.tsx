import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { CareerDnaTabs } from "@/components/career-dna/career-dna-tabs";

export default async function CareerDnaPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const [{ data: experiences }, { data: skills }, { data: evidence }] =
    await Promise.all([
      supabase
        .from("career_experiences")
        .select("*")
        .eq("user_id", user!.id)
        .order("start_date", { ascending: false }),
      supabase
        .from("career_skills")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("career_evidence")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Career DNA
        </h1>
        <p className="text-muted-foreground">
          The structured, evidence-backed representation of your career - this is what powers matching, gap analysis, and truthful resume tailoring, not just your resume text.
        </p>
      </div>

      <CareerDnaTabs
        experiences={experiences ?? []}
        skills={skills ?? []}
        evidence={evidence ?? []}
      />
    </div>
  );
}
