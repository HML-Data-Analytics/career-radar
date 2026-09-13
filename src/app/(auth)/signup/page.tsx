import { AuthForm } from "@/components/auth-form";
import { signUpAction } from "@/lib/auth/actions";

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      <AuthForm mode="signup" action={signUpAction} />
    </div>
  );
}
