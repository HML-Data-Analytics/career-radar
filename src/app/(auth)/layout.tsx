import { Radar } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AuthHero } from "@/components/auth-hero";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <AuthHero />
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 py-12 lg:w-1/2 lg:flex-none">
        <div className="glass flex size-10 shrink-0 items-center justify-center rounded-2xl text-primary lg:hidden">
          <Radar className="size-5" />
        </div>
        {children}
      </div>
    </div>
  );
}
