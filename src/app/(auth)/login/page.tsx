import { AuthForm } from "@/components/auth-form";
import { signInAction } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <AuthForm mode="login" action={signInAction} />
    </div>
  );
}
