import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Radar, Target, FileCheck2, LineChart } from "lucide-react";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex h-dvh flex-col items-center justify-center gap-4 overflow-hidden px-4 py-6 text-center sm:gap-8 sm:py-12">
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-2.5 sm:gap-4">
        <div className="glass flex size-10 shrink-0 items-center justify-center rounded-2xl text-primary sm:size-14">
          <Radar className="size-5 sm:size-7" />
        </div>
        <h1 className="font-heading max-w-2xl text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl sm:leading-tight lg:text-5xl">
          Make better career decisions, not just more applications
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground text-balance sm:text-base">
          Career Radar builds a truthful picture of your career, scores every
          opportunity on fit - not just keywords - and helps you apply with a
          tailored, honest application package.
        </p>
        <div className="mt-1 flex gap-3 sm:mt-4">
          <Button size="lg" render={<Link href="/signup">Get started</Link>} />
          <Button
            size="lg"
            variant="outline"
            className="glass border-white/20"
            render={<Link href="/login">Sign in</Link>}
          />
        </div>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-3 gap-2 sm:gap-4">
        <FeatureCard
          icon={Target}
          title="Should I apply?"
          description="Qualification, career fit, and opportunity quality - scored separately."
        />
        <FeatureCard
          icon={FileCheck2}
          title="Truthful tailoring"
          description="Tailored from verified evidence only. Nothing fabricated."
        />
        <FeatureCard
          icon={LineChart}
          title="Learn from outcomes"
          description="Every result sharpens future recommendations."
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
    <div className="glass-panel flex flex-col items-start gap-1 p-3 text-left sm:gap-2 sm:p-5">
      <div className="glass flex size-7 shrink-0 items-center justify-center rounded-xl text-primary sm:size-9">
        <Icon className="size-3.5 sm:size-4" />
      </div>
      <p className="text-xs font-medium sm:text-base">{title}</p>
      <p className="hidden text-sm text-muted-foreground sm:block">{description}</p>
    </div>
  );
}
