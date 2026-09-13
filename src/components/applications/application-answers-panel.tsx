"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  generateApplicationAnswerAction,
  updateApplicationAnswerAction,
  setApplicationAnswerStatusAction,
  deleteApplicationAnswerAction,
} from "@/lib/actions/applicationAnswers";
import { Sparkles, Trash2, Check, X } from "lucide-react";

type Answer = {
  id: string;
  question: string;
  answer: string | null;
  status: string;
};

export function ApplicationAnswersPanel({
  applicationId,
  answers,
}: {
  applicationId: string;
  answers: Answer[];
}) {
  const [state, formAction, isPending] = useActionState(
    generateApplicationAnswerAction,
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="glass flex flex-col gap-3 rounded-xl p-4">
        <input type="hidden" name="applicationId" value={applicationId} />
        <Textarea
          name="question"
          placeholder="Paste an application question here…"
          rows={2}
          required
          className="glass border-white/20"
        />
        <Button type="submit" disabled={isPending} className="w-fit gap-2">
          <Sparkles className="size-4" />
          {isPending ? "Generating..." : "Generate answer"}
        </Button>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </form>

      <div className="flex flex-col gap-3">
        {answers.map((answer) => (
          <AnswerCard key={answer.id} answer={answer} />
        ))}
      </div>
    </div>
  );
}

function AnswerCard({ answer }: { answer: Answer }) {
  const [text, setText] = useState(answer.answer ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="glass-panel flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{answer.question}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant={answer.status === "approved" ? "default" : "secondary"} className="text-xs">
            {answer.status}
          </Badge>
          <form action={deleteApplicationAnswerAction.bind(null, answer.id)}>
            <Button type="submit" variant="ghost" size="icon-sm">
              <Trash2 className="size-3.5" />
            </Button>
          </form>
        </div>
      </div>
      <Textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        rows={4}
        className="glass border-white/20"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="glass border-white/20"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateApplicationAnswerAction(answer.id, text);
              setSaved(true);
            })
          }
        >
          {isPending ? "Saving..." : saved ? "Saved" : "Save edits"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="glass gap-1 border-white/20"
          onClick={() =>
            startTransition(() => {
              setApplicationAnswerStatusAction(answer.id, "approved");
            })
          }
        >
          <Check className="size-3.5" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="glass gap-1 border-white/20"
          onClick={() =>
            startTransition(() => {
              setApplicationAnswerStatusAction(answer.id, "rejected");
            })
          }
        >
          <X className="size-3.5" /> Reject
        </Button>
      </div>
    </div>
  );
}
