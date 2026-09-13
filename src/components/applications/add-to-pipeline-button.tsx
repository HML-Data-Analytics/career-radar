"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createApplicationFromJobAction } from "@/lib/actions/applications";
import { ClipboardList } from "lucide-react";

export function AddToPipelineButton({ jobId }: { jobId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      className="glass gap-2 border-white/20"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await createApplicationFromJobAction(jobId);
        })
      }
    >
      <ClipboardList className="size-4" />
      {isPending ? "Adding…" : "Add to Applications"}
    </Button>
  );
}
