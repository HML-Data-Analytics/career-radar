"use client";

import { useState } from "react";
import { LiquidTabs } from "@/components/ui/liquid-tabs";
import { ApplicationPackagePanel } from "@/components/applications/application-package-panel";
import { ApplicationAnswersPanel } from "@/components/applications/application-answers-panel";
import { InterviewPrepPanel } from "@/components/applications/interview-prep-panel";
import type { ComponentProps } from "react";

const TAB_OPTIONS = [
  { value: "package", label: "Application Package" },
  { value: "answers", label: "Answers" },
  { value: "interview", label: "Interview Prep" },
];

export function ApplicationDetailTabs({
  applicationId,
  applicationPackage,
  answers,
  interviewPrep,
}: {
  applicationId: string;
  applicationPackage: ComponentProps<typeof ApplicationPackagePanel>["applicationPackage"];
  answers: ComponentProps<typeof ApplicationAnswersPanel>["answers"];
  interviewPrep: ComponentProps<typeof InterviewPrepPanel>["prep"];
}) {
  const [tab, setTab] = useState("package");

  return (
    <div className="flex flex-col gap-4">
      <LiquidTabs
        options={TAB_OPTIONS}
        value={tab}
        onValueChange={setTab}
        layoutGroup="application-detail-tabs"
      />
      {tab === "package" ? (
        <ApplicationPackagePanel
          applicationId={applicationId}
          applicationPackage={applicationPackage}
        />
      ) : null}
      {tab === "answers" ? (
        <ApplicationAnswersPanel applicationId={applicationId} answers={answers} />
      ) : null}
      {tab === "interview" ? (
        <InterviewPrepPanel applicationId={applicationId} prep={interviewPrep} />
      ) : null}
    </div>
  );
}
