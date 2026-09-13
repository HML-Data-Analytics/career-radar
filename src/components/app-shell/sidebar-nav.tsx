"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import { Radar } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="glass-strong sticky top-4 flex h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col gap-1 rounded-2xl p-4">
      <Link href="/dashboard" className="mb-4 flex items-center gap-2 px-2">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
          <Radar className="size-5" />
        </div>
        <span className="font-heading text-base font-semibold tracking-tight">
          Career Radar
        </span>
      </Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
                "hover:bg-white/10 hover:text-foreground",
                active && "glass text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
