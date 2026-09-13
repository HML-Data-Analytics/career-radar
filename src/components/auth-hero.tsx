import { Radar, Target, FileCheck2, LineChart } from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Should I apply?",
    description: "Qualification, career fit, and opportunity quality - scored separately.",
  },
  {
    icon: FileCheck2,
    title: "Truthful tailoring",
    description: "Tailored from verified evidence only. Nothing fabricated.",
  },
  {
    icon: LineChart,
    title: "Learn from outcomes",
    description: "Every result sharpens future recommendations.",
  },
];

export function AuthHero() {
  return (
    <div className="relative flex h-full flex-col justify-center gap-10 overflow-hidden p-12 xl:p-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] size-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.6_0.18_258/35%),transparent_70%)] blur-2xl" />
        <div className="absolute right-[-15%] bottom-[-15%] size-[380px] rounded-full bg-[radial-gradient(circle,oklch(0.6_0.16_280/30%),transparent_70%)] blur-2xl" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass flex size-14 shrink-0 items-center justify-center rounded-2xl text-primary">
          <Radar className="size-7" />
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-heading max-w-md text-3xl leading-tight font-semibold tracking-tight text-balance xl:text-4xl">
            Make better career decisions, not just more applications
          </h1>
          <p className="max-w-sm text-muted-foreground text-balance">
            Career Radar builds a truthful picture of your career and scores
            every opportunity on fit - not just keywords.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="glass-panel flex items-start gap-3 p-4">
            <div className="glass flex size-9 shrink-0 items-center justify-center rounded-xl text-primary">
              <feature.icon className="size-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
