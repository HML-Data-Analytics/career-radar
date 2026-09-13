"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  navItems,
  mobilePrimaryNavHrefs,
  desktopPrimaryNavHrefs,
  type NavItem,
} from "./nav-items";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors",
        active && "text-primary",
      )}
    >
      <Icon className="size-5" />
      <span className="max-w-full truncate">{item.shortLabel ?? item.label}</span>
    </Link>
  );
}

function MoreButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors",
        active && "text-primary",
      )}
    >
      <Menu className="size-5" />
      More
    </button>
  );
}

function MoreSheet({
  items,
  open,
  onOpenChange,
}: {
  items: NavItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="glass-strong rounded-t-3xl border-t-0">
        <SheetHeader>
          <SheetTitle>More</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-3 px-4 pb-6 sm:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "glass flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center text-xs font-medium text-muted-foreground",
                  active && "text-primary",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Floating bottom tab bar - the primary navigation on every screen size,
 * per iOS 27's persistent (non-collapsing) floating Liquid Glass tab bar.
 * Mobile shows a narrower primary set; desktop shows more directly since
 * there's room, with everything else behind "More".
 */
export function BottomNav() {
  const pathname = usePathname();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);

  const mobilePrimary = navItems.filter((item) =>
    mobilePrimaryNavHrefs.includes(item.href),
  );
  const mobileMore = navItems.filter(
    (item) => !mobilePrimaryNavHrefs.includes(item.href),
  );
  const mobileMoreActive = mobileMore.some((item) => isActive(pathname, item.href));

  const desktopPrimary = navItems.filter((item) =>
    desktopPrimaryNavHrefs.includes(item.href),
  );
  const desktopMore = navItems.filter(
    (item) => !desktopPrimaryNavHrefs.includes(item.href),
  );
  const desktopMoreActive = desktopMore.some((item) => isActive(pathname, item.href));

  return (
    <>
      {/* Mobile bar */}
      <nav
        className="glass-strong fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-full px-1 py-1.5 sm:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        {mobilePrimary.map((item) => (
          <TabLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <MoreButton active={mobileMoreActive} onClick={() => setMobileMoreOpen(true)} />
      </nav>
      <MoreSheet items={mobileMore} open={mobileMoreOpen} onOpenChange={setMobileMoreOpen} />

      {/* Desktop / tablet bar */}
      <nav className="glass-strong fixed inset-x-0 bottom-4 z-20 mx-auto hidden w-fit items-center gap-1 rounded-full px-3 py-2 sm:flex">
        <Link href="/dashboard" className="mr-2 flex items-center gap-2 pl-1">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Radar className="size-4" />
          </div>
        </Link>
        {desktopPrimary.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                active && "text-primary",
              )}
            >
              <Icon className="size-5" />
              <span className="max-w-20 truncate">{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setDesktopMoreOpen(true)}
          title="More"
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground",
            desktopMoreActive && "text-primary",
          )}
        >
          <Menu className="size-5" />
          More
        </button>
      </nav>
      <MoreSheet items={desktopMore} open={desktopMoreOpen} onOpenChange={setDesktopMoreOpen} />
    </>
  );
}
