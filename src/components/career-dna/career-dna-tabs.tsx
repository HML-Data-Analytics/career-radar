"use client";

import { useState } from "react";
import { LiquidTabs } from "@/components/ui/liquid-tabs";
import { ExperienceList } from "@/components/career-dna/experience-list";
import { SkillList } from "@/components/career-dna/skill-list";
import { EvidenceList } from "@/components/career-dna/evidence-list";
import type { ComponentProps } from "react";

const TAB_OPTIONS = [
  { value: "experience", label: "Experience" },
  { value: "skills", label: "Skills" },
  { value: "evidence", label: "Evidence" },
];

export function CareerDnaTabs({
  experiences,
  skills,
  evidence,
}: {
  experiences: ComponentProps<typeof ExperienceList>["experiences"];
  skills: ComponentProps<typeof SkillList>["skills"];
  evidence: ComponentProps<typeof EvidenceList>["evidence"];
}) {
  const [tab, setTab] = useState("experience");

  return (
    <div className="flex flex-col gap-4">
      <LiquidTabs
        options={TAB_OPTIONS}
        value={tab}
        onValueChange={setTab}
        layoutGroup="career-dna-tabs"
      />
      {tab === "experience" ? <ExperienceList experiences={experiences} /> : null}
      {tab === "skills" ? <SkillList skills={skills} /> : null}
      {tab === "evidence" ? <EvidenceList evidence={evidence} /> : null}
    </div>
  );
}
