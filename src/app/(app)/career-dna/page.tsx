import { createClient } from "@/lib/supabase/server";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ExperienceList } from "@/components/career-dna/experience-list";
import { SkillList } from "@/components/career-dna/skill-list";
import { EvidenceList } from "@/components/career-dna/evidence-list";

export default async function CareerDnaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          The structured, evidence-backed representation of your career — this is what powers matching, gap analysis, and truthful resume tailoring, not just your resume text.
        </p>
      </div>

      <Tabs defaultValue="experience">
        <TabsList className="glass">
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>
        <TabsContent value="experience" className="mt-4">
          <ExperienceList experiences={experiences ?? []} />
        </TabsContent>
        <TabsContent value="skills" className="mt-4">
          <SkillList skills={skills ?? []} />
        </TabsContent>
        <TabsContent value="evidence" className="mt-4">
          <EvidenceList evidence={evidence ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
