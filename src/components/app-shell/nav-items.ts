import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Briefcase,
  Compass,
  Dna,
  Bookmark,
  FileText,
  ClipboardList,
  MessageSquareText,
  BarChart3,
  UserRound,
  SlidersHorizontal,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  /** Shorter label for tight tab-bar space; falls back to `label`. */
  shortLabel?: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", shortLabel: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Career Strategy", shortLabel: "Strategy", href: "/career-strategy", icon: Compass },
  { label: "Career DNA", shortLabel: "DNA", href: "/career-dna", icon: Dna },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Resumes", href: "/resumes", icon: FileText },
  { label: "Applications", shortLabel: "Applied", href: "/applications", icon: ClipboardList },
  { label: "Interview Prep", shortLabel: "Interview", href: "/interview-prep", icon: MessageSquareText },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Career Profile", shortLabel: "Profile", href: "/career-profile", icon: UserRound },
  { label: "Preferences", href: "/preferences", icon: SlidersHorizontal },
  { label: "Settings", href: "/settings", icon: Settings },
];

/**
 * Destinations shown directly in the floating bottom tab bar, vs. tucked
 * behind "More" - narrower on mobile (iOS convention: ~4-5 primary), wider
 * on desktop where there's room for more without crowding.
 */
export const mobilePrimaryNavHrefs = ["/dashboard", "/jobs", "/resumes", "/applications"];

export const desktopPrimaryNavHrefs = [
  "/dashboard",
  "/jobs",
  "/career-dna",
  "/saved",
  "/resumes",
  "/applications",
  "/analytics",
  "/career-profile",
];
