"use client";

import { useSyncExternalStore, useEffect } from "react";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemePreference = "light" | "dark" | "system";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: MonitorSmartphone },
];

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** The user's chosen preference (what the toggle should show as active). */
function getSnapshot(): ThemePreference {
  const stored = localStorage.getItem("theme");
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "light";
}

function getServerSnapshot(): ThemePreference {
  return "light";
}

function resolveSystemPreference(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Applies data-theme for the given preference. "system" is resolved once
 * against the current OS setting - the live-update listener (below) keeps
 * it in sync if the OS setting changes afterward. */
function applyResolvedTheme(preference: ThemePreference) {
  const root = document.documentElement;
  const resolved = preference === "system" ? resolveSystemPreference() : preference;
  if (resolved === "light") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", "dark");
  }
}

function setPreference(preference: ThemePreference) {
  localStorage.setItem("theme", preference);
  applyResolvedTheme(preference);
  listeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyResolvedTheme("system");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [preference]);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="glass flex items-center gap-0.5 rounded-full p-0.5"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => setPreference(option.value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors",
              "hover:text-foreground",
              active && "bg-primary text-primary-foreground",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
