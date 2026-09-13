"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, mobilePrimaryNavHrefs, desktopPrimaryNavHrefs } from "./nav-items";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const LIQUID_SPRING = { type: "spring" as const, stiffness: 500, damping: 35 };

/**
 * A tab whose selected state is indicated by a shared, spring-animated
 * "liquid" pill that morphs and slides between tabs (Motion's layoutId
 * makes it track whichever tab is currently marked active) - matching
 * iOS's Liquid Glass tab bar, where the highlight fluidly moves rather
 * than each icon just changing color on its own.
 */
function Tab({
  href,
  label,
  Icon,
  active,
  layoutGroup,
  desktop,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  layoutGroup: string;
  desktop?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "relative flex flex-col items-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors",
        desktop ? "px-3 py-1.5 hover:text-foreground" : "flex-1 px-1 py-1.5",
        active && "text-primary",
      )}
    >
      {active ? (
        <motion.div
          layoutId={`${layoutGroup}-active-pill`}
          className="bg-primary/12 absolute inset-0 rounded-full"
          transition={LIQUID_SPRING}
        />
      ) : null}
      <Icon className="relative size-5" />
      <span className={cn("relative max-w-full truncate", desktop && "max-w-20")}>
        {label}
      </span>
    </Link>
  );
}

/**
 * Floating bottom tab bar - the primary navigation on every screen size,
 * per iOS 27's persistent (non-collapsing) floating Liquid Glass tab bar.
 * Mobile shows a narrower primary set; desktop shows more directly since
 * there's room. "More" is a normal destination (a full /more page), not an
 * overlay - consistent with how every other tab behaves.
 */
export function BottomNav() {
  const pathname = usePathname();

  const mobilePrimary = navItems.filter((item) =>
    mobilePrimaryNavHrefs.includes(item.href),
  );
  const desktopPrimary = navItems.filter((item) =>
    desktopPrimaryNavHrefs.includes(item.href),
  );
  const onMorePage = pathname === "/more" || pathname.startsWith("/more/");

  return (
    <>
      {/* Mobile bar */}
      <nav
        className="glass-strong fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-full px-1 py-1.5 sm:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        {mobilePrimary.map((item) => (
          <Tab
            key={item.href}
            href={item.href}
            label={item.shortLabel ?? item.label}
            Icon={item.icon}
            active={isActive(pathname, item.href)}
            layoutGroup="mobile-nav"
          />
        ))}
        <Tab
          href="/more"
          label="More"
          Icon={Menu}
          active={onMorePage}
          layoutGroup="mobile-nav"
        />
      </nav>

      {/* Desktop / tablet bar */}
      <nav className="glass-strong fixed inset-x-0 bottom-4 z-20 mx-auto hidden w-fit items-center gap-1 rounded-full px-3 py-2 sm:flex">
        <Link href="/dashboard" prefetch className="mr-2 flex items-center gap-2 pl-1">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Radar className="size-4" />
          </div>
        </Link>
        {desktopPrimary.map((item) => (
          <Tab
            key={item.href}
            href={item.href}
            label={item.shortLabel ?? item.label}
            Icon={item.icon}
            active={isActive(pathname, item.href)}
            layoutGroup="desktop-nav"
            desktop
          />
        ))}
        <Tab
          href="/more"
          label="More"
          Icon={Menu}
          active={onMorePage}
          layoutGroup="desktop-nav"
          desktop
        />
      </nav>
    </>
  );
}
