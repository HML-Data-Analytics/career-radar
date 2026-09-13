"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateApplicationStatusAction,
  type ApplicationStatus,
} from "@/lib/actions/applications";

const STATUSES = [
  "DISCOVERED",
  "SAVED",
  "REVIEWING",
  "RESUME_TAILORED",
  "RESUME_APPROVED",
  "READY_TO_APPLY",
  "APPLIED",
  "RECRUITER_CONTACT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(() => {
          updateApplicationStatusAction(
            applicationId,
            value as ApplicationStatus,
          );
        })
      }
    >
      <SelectTrigger className="glass w-44 border-white/20">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
