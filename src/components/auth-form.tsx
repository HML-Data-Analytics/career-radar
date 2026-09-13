"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthActionState } from "@/lib/auth/actions";

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const isLogin = mode === "login";

  return (
    <Card className="glass-strong">
      <CardHeader>
        <CardTitle className="text-xl">
          {isLogin ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? "Sign in to your Career Radar workspace."
            : "Start building your Career DNA and discover better opportunities."}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="glass border-white/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              className="glass border-white/20"
            />
          </div>
          {state?.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "Please wait…"
              : isLogin
                ? "Sign in"
                : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-foreground underline underline-offset-4">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-foreground underline underline-offset-4">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
