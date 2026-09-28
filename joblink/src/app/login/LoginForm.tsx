"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { login, signInWithGoogle } from "./actions";
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
        <form action={signInWithGoogle}>
          <GoogleButton />
        </form>
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
              href="/"
              className="rounded-sm text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01224F]"
            >
              Forgot password?
            </Link>
          }
        />

        <FormMessage message={message} />

        <div className="pt-2">
          <SubmitButton label="Sign in" pendingLabel="Signing in…" />
        </div>
      </form>
    </AuthShell>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginFormInner />
    </Suspense>
  );
}
