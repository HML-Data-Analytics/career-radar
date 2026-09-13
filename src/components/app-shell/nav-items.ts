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
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Career Strategy", href: "/career-strategy", icon: Compass },
  { label: "Career DNA", href: "/career-dna", icon: Dna },
  { label: "Saved", href: "/saved", icon: Bookmark },
  { label: "Resumes", href: "/resumes", icon: FileText },
  { label: "Applications", href: "/applications", icon: ClipboardList },
  { label: "Interview Prep", href: "/interview-prep", icon: MessageSquareText },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Career Profile", href: "/career-profile", icon: UserRound },
  { label: "Preferences", href: "/preferences", icon: SlidersHorizontal },
  { label: "Settings", href: "/settings", icon: Settings },
];
