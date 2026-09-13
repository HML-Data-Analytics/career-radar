import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOutAction } from "@/lib/auth/actions";
import { LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";

export function TopBar({
  email,
  firstName,
}: {
  email: string;
  firstName?: string | null;
}) {
  const initials = (firstName?.[0] ?? email[0] ?? "?").toUpperCase();

  return (
    <header className="glass-strong sticky top-3 z-10 flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 sm:top-4 sm:gap-4 sm:px-4 sm:py-3">
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="gap-2 rounded-full px-2">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="glass-strong w-56">
            <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
              {email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <Link href="/career-profile">
                  <UserRound className="mr-2 size-4" /> Career Profile
                </Link>
              }
            />
            <DropdownMenuItem
              render={
                <Link href="/settings">
                  <Settings className="mr-2 size-4" /> Settings
                </Link>
              }
            />
            <DropdownMenuSeparator />
            <form action={signOutAction}>
              <DropdownMenuItem
                render={
                  <button type="submit" className="w-full text-left">
                    <LogOut className="mr-2 size-4" /> Sign out
                  </button>
                }
              />
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
