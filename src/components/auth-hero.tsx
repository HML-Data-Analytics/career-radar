import { AuthIllustration } from "@/components/auth-illustration";

export function AuthHero() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden p-12 text-center xl:p-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] size-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.6_0.18_258/35%),transparent_70%)] blur-2xl" />
        <div className="absolute right-[-15%] bottom-[-15%] size-[380px] rounded-full bg-[radial-gradient(circle,oklch(0.6_0.16_280/30%),transparent_70%)] blur-2xl" />
      </div>

      <AuthIllustration />

      <div className="flex flex-col gap-3">
        <h1 className="font-heading max-w-md text-3xl leading-tight font-semibold tracking-tight text-balance xl:text-4xl">
          Make better career decisions, not just more applications
        </h1>
        <p className="max-w-sm mx-auto text-muted-foreground text-balance">
          Career Radar builds a truthful picture of your career and scores
          every opportunity on fit - not just keywords.
        </p>
      </div>
    </div>
  );
}
