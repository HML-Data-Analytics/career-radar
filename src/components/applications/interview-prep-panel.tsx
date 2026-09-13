"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateInterviewPrepAction } from "@/lib/actions/interviewPrep";
import { Sparkles } from "lucide-react";

type QuestionItem = { question: string; suggestedApproach: string };
type Story = { title: string; story: string; relevantFor: string[] };

type InterviewPrepData = {
  likely_questions: QuestionItem[] | null;
  technical_questions: QuestionItem[] | null;
  leadership_questions: QuestionItem[] | null;
  behavioral_questions: QuestionItem[] | null;
  company_specific_questions: QuestionItem[] | null;
  jd_specific_questions: QuestionItem[] | null;
  potential_concerns: string[] | null;
  recommended_stories: Story[] | null;
};

const SECTIONS: { key: keyof InterviewPrepData; label: string }[] = [
  { key: "jd_specific_questions", label: "This job's likely questions" },
  { key: "technical_questions", label: "Technical" },
  { key: "leadership_questions", label: "Leadership" },
  { key: "behavioral_questions", label: "Behavioral" },
  { key: "company_specific_questions", label: "Company-specific" },
  { key: "likely_questions", label: "General" },
];

export function InterviewPrepPanel({
  applicationId,
  prep,
}: {
  applicationId: string;
  prep: InterviewPrepData | null;
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
            const result = await generateInterviewPrepAction(applicationId);
            if (result?.error) setError(result.error);
          })
        }
      >
        <Sparkles className="size-4" />
        {isPending ? "Generating..." : prep ? "Regenerate interview prep" : "Generate interview prep"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {prep ? (
        <div className="flex flex-col gap-4">
          {SECTIONS.map(({ key, label }) => {
            const items = prep[key] as QuestionItem[] | null;
            if (!items || items.length === 0) return null;
            return (
              <div key={key} className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {label}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <div key={item.question} className="glass rounded-xl p-3 text-sm">
                      <p className="font-medium">{item.question}</p>
                      <p className="mt-1 text-muted-foreground">{item.suggestedApproach}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {prep.recommended_stories && prep.recommended_stories.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Recommended stories
              </p>
              <div className="flex flex-col gap-2">
                {prep.recommended_stories.map((story) => (
                  <div key={story.title} className="glass rounded-xl p-3 text-sm">
                    <p className="font-medium">{story.title}</p>
                    <p className="mt-1 text-muted-foreground">{story.story}</p>
                    {story.relevantFor.length > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Good for: {story.relevantFor.join(", ")}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {prep.potential_concerns && prep.potential_concerns.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Potential concerns
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {prep.potential_concerns.map((concern) => (
                  <li key={concern}>- {concern}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
