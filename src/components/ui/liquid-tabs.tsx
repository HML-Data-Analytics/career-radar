"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const LIQUID_SPRING = { type: "spring" as const, stiffness: 500, damping: 35 };

export type LiquidTabOption = {
  value: string;
  label: string;
};

/**
 * A glass tab switcher with the same spring-animated "liquid" active pill
 * as the bottom nav (Motion's layoutId morphs/slides it between tabs),
 * rather than shadcn Tabs' static background swap. Uncontrolled with an
 * optional controlled `value`/`onValueChange`, and an optional
 * `layoutGroup` so multiple LiquidTabs instances on the same page don't
 * share one animated pill.
 */
export function LiquidTabs({
  options,
  value,
  defaultValue,
  onValueChange,
  layoutGroup = "liquid-tabs",
  className,
}: {
  options: LiquidTabOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  layoutGroup?: string;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? options[0]?.value,
  );
  const active = value ?? internalValue;

  function select(next: string) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

  return (
    <div
      role="tablist"
      className={cn("glass inline-flex w-fit items-center gap-0.5 rounded-full p-1", className)}
    >
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(option.value)}
            className={cn(
              "relative rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
              isActive && "text-primary-foreground",
            )}
          >
            {isActive ? (
              <motion.div
                layoutId={`${layoutGroup}-active-pill`}
                className="bg-primary absolute inset-0 rounded-full"
                transition={LIQUID_SPRING}
              />
            ) : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
