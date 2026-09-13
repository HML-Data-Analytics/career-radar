import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AuthHero } from "@/components/auth-hero";
import { AuthIllustration } from "@/components/auth-illustration";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="hidden lg:block lg:w-1/2">
        <AuthHero />
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-10 lg:w-1/2 lg:flex-none">
        <AuthIllustration className="w-full max-w-[220px] lg:hidden" />
        {children}
      </div>
    </div>
  );
}
