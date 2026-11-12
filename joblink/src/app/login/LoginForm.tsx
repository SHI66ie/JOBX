"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import {
  FormMessage,
  GoogleButton,
  OrDivider,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setGoogleError(null);
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) {
        setGoogleError(error.message);
        setGoogleLoading(false);
      }
    } catch (err: unknown) {
      setGoogleError(err instanceof Error ? err.message : "Failed to connect to Google");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      alternate={{ prompt: "New to JOMP?", label: "Create an account", href: "/signup" }}
      showcase={{
        title: "Where careers find their next move.",
        body: "Real roles from real employers, a profile that works for you, and free tools to help you land the job.",
      }}
    >
      <AuthHeading title="Welcome back" description="Sign in to pick up where you left off." />

      <div className="auth-rise mt-9 [animation-delay:80ms]">
        <GoogleButton
          type="button"
          onClick={handleGoogleSignIn}
          isLoading={googleLoading}
        />
      </div>

      <OrDivider />

      <form action={login} className="auth-rise space-y-5 [animation-delay:160ms]">
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          spellCheck={false}
          required
        />
        <PasswordField
          id="password"
          name="password"
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          required
          labelAction={
            <Link
              href="/login?message=Please+contact+support+at+jomponline.mail%40gmail.com+to+reset+your+password"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              Forgot password?
            </Link>
          }
        />

        <FormMessage message={googleError || message} />

        <div className="pt-2">
          <SubmitButton label="Sign in" pendingLabel="Signing in…" />
        </div>
      </form>
    </AuthShell>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
