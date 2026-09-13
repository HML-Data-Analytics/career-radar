import Link from "next/link";
import { navItems, mobilePrimaryNavHrefs } from "@/components/app-shell/nav-items";

export default function MorePage() {
  const items = navItems.filter((item) => !mobilePrimaryNavHrefs.includes(item.href));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">More</h1>
        <p className="text-muted-foreground">Everything else, in one place.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="glass-panel flex flex-col items-center gap-2 p-5 text-center transition-colors hover:bg-white/10"
            >
              <div className="glass flex size-10 items-center justify-center rounded-xl text-primary">
                <Icon className="size-5" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
