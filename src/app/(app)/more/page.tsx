import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  navItems,
  mobilePrimaryNavHrefs,
  desktopPrimaryNavHrefs,
  type NavItem,
} from "@/components/app-shell/nav-items";

function NavList({ items }: { items: NavItem[] }) {
  return (
    <div className="glass-panel flex flex-col divide-y divide-border overflow-hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/10"
          >
            <div className="glass flex size-8 shrink-0 items-center justify-center rounded-lg text-primary">
              <Icon className="size-4" />
            </div>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}

export default function MorePage() {
  const mobileItems = navItems.filter(
    (item) => !mobilePrimaryNavHrefs.includes(item.href),
  );
  const desktopItems = navItems.filter(
    (item) => !desktopPrimaryNavHrefs.includes(item.href),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">More</h1>
        <p className="text-muted-foreground">Everything else, in one place.</p>
      </div>
      <div className="sm:hidden">
        <NavList items={mobileItems} />
      </div>
      <div className="hidden sm:block">
        <NavList items={desktopItems} />
      </div>
    </div>
  );
}
