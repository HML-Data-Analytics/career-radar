import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Radar, Target, FileCheck2, LineChart } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-10 px-4 py-16 text-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="glass flex size-14 items-center justify-center rounded-2xl text-primary">
          <Radar className="size-7" />
        </div>
        <h1 className="font-heading max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Make better career decisions, not just more applications
        </h1>
        <p className="max-w-xl text-muted-foreground text-balance">
          Career Radar builds a truthful picture of your career, scores every
          opportunity on fit - not just keywords - and helps you apply with a
          tailored, honest application package.
        </p>
        <div className="mt-4 flex gap-3">
          <Button size="lg" render={<Link href="/signup">Get started</Link>} />
          <Button
            size="lg"
            variant="outline"
            className="glass border-white/20"
            render={<Link href="/login">Sign in</Link>}
          />
        </div>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={Target}
          title="Should I apply?"
          description="Qualification, career fit, and opportunity quality - scored separately so you never chase the wrong role."
        />
        <FeatureCard
          icon={FileCheck2}
          title="Truthful tailoring"
          description="Resumes are tailored from verified evidence only. No fabricated skills, employers, or metrics."
        />
        <FeatureCard
          icon={LineChart}
          title="Learn from outcomes"
          description="Every application result feeds back into sharper recommendations over time."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Target;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel flex flex-col items-start gap-2 p-5 text-left">
      <div className="glass flex size-9 items-center justify-center rounded-xl text-primary">
        <Icon className="size-4" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
