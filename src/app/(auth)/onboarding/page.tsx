import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CareerProfileForm } from "@/components/career-profile-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Let&apos;s build your Career DNA
        </h1>
        <p className="text-muted-foreground">
          Start with the basics — you can add detailed experience, skills, and evidence afterward.
        </p>
      </div>
      <CareerProfileForm profile={null} />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <a href="/dashboard" className="underline underline-offset-4">
          Skip for now
        </a>
      </p>
    </div>
  );
}
