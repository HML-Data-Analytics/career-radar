"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateApplicationPackageAction } from "@/lib/actions/applicationPackage";
import { Sparkles } from "lucide-react";

type ApplicationPackage = {
  cover_letter: string | null;
  elevator_pitch: string | null;
  why_this_role: string | null;
  why_this_company: string | null;
  key_talking_points: string[] | null;
  potential_weaknesses: string[] | null;
};

export function ApplicationPackagePanel({
  applicationId,
  applicationPackage,
}: {
  applicationId: string;
  applicationPackage: ApplicationPackage | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <Button
        className="w-fit gap-2"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await generateApplicationPackageAction(applicationId);
            if (result?.error) setError(result.error);
          })
        }
      >
        <Sparkles className="size-4" />
        {isPending
          ? "Generating..."
          : applicationPackage
            ? "Regenerate application package"
            : "Generate application package"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {applicationPackage ? (
        <div className="flex flex-col gap-4 text-sm">
          {applicationPackage.elevator_pitch ? (
            <Section title="30-second introduction">
              <p className="text-muted-foreground">{applicationPackage.elevator_pitch}</p>
            </Section>
          ) : null}

          {applicationPackage.why_this_role || applicationPackage.why_this_company ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {applicationPackage.why_this_role ? (
                <Section title="Why this role">
                  <p className="text-muted-foreground">{applicationPackage.why_this_role}</p>
                </Section>
              ) : null}
              {applicationPackage.why_this_company ? (
                <Section title="Why this company">
                  <p className="text-muted-foreground">{applicationPackage.why_this_company}</p>
                </Section>
              ) : null}
            </div>
          ) : null}

          {applicationPackage.key_talking_points && applicationPackage.key_talking_points.length > 0 ? (
            <Section title="Key talking points">
              <ul className="flex flex-col gap-1 text-muted-foreground">
                {applicationPackage.key_talking_points.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            </Section>
          ) : null}

          {applicationPackage.cover_letter ? (
            <Section title="Cover letter">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {applicationPackage.cover_letter}
              </p>
            </Section>
          ) : null}

          {applicationPackage.potential_weaknesses && applicationPackage.potential_weaknesses.length > 0 ? (
            <Section title="Potential weaknesses to be ready for">
              <ul className="flex flex-col gap-1 text-muted-foreground">
                {applicationPackage.potential_weaknesses.map((weakness) => (
                  <li key={weakness}>- {weakness}</li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass flex flex-col gap-1.5 rounded-xl p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      {children}
    </div>
  );
}
