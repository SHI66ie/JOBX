"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { adminLogin } from "./actions";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import {
  FormMessage,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields";

function AdminLoginFormInner() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <AuthShell
      alternate={{ prompt: "Not an admin?", label: "Go to main login", href: "/login" }}
      showcase={{
        title: "Admin access only.",
        body: "This area is restricted to JOMP platform administrators. If you're a candidate or employer, use the main login instead.",
      }}
    >
      <AuthHeading
        title="Admin sign in"
        description={
          <>
            Restricted area.{" "}
            <span className="text-red-500 font-medium">
              Admins only.
            </span>
          </>
        }
      />

      <form action={adminLogin} className="auth-rise mt-9 space-y-5 [animation-delay:80ms]">
        <TextField
          id="email"
          name="email"
          type="email"
          label="Admin email"
          placeholder="admin@jomponline.com"
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
        />

        <FormMessage message={message} />

        <div className="pt-2">
          <SubmitButton label="Sign in to Admin" pendingLabel="Signing in…" />
        </div>
      </form>
    </AuthShell>
  );
}

export default function AdminLoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AdminLoginFormInner />
    </Suspense>
  );
}
