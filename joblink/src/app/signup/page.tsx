"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signup, signInWithGoogle } from "../login/actions";
import { cn } from "@/lib/utils";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import {
  FormMessage,
  GoogleButton,
  OrDivider,
  PasswordField,
  SubmitButton,
  TextField,
} from "@/components/auth/auth-fields";

const ROLES = [
  { value: "candidate", label: "I'm job hunting", href: "/signup" },
  { value: "employer", label: "I'm hiring", href: "/signup?role=employer" },
] as const;

function SignupForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const role = searchParams.get("role") === "employer" ? "employer" : "candidate";
  const isEmployer = role === "employer";

  return (
    <AuthShell
      alternate={{ prompt: "Already have an account?", label: "Sign in", href: "/login" }}
      showcase={
        isEmployer
          ? {
              title: "Hire the right people, faster.",
              body: "Post roles, review applicants in one place, and connect with qualified candidates across the JOMP network.",
            }
          : {
              title: "Your next role starts here.",
              body: "Browse employer-posted jobs, apply in a few clicks, and build connections that move your career forward.",
            }
      }
    >
      <AuthHeading
        title={isEmployer ? "Create an employer account" : "Create your account"}
        description={isEmployer ? "Start posting roles in minutes." : "Free forever for job seekers."}
      />

      <nav
        aria-label="Account type"
        className="auth-rise mt-7 grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1 [animation-delay:60ms]"
      >
        {ROLES.map((option) => {
          const active = option.value === role;
          return (
            <Link
              key={option.value}
              href={option.href}
              replace
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center justify-center rounded-[9px] text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01224F]",
                active
                  ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.06)]"
                  : "text-neutral-500 hover:text-neutral-800",
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      <div className="auth-rise mt-6 [animation-delay:120ms]">
        <form action={signInWithGoogle}>
          <input type="hidden" name="role" value={role} />
          <GoogleButton label="Sign up with Google" />
        </form>
      </div>

      <OrDivider />

      <form action={signup} className="auth-rise space-y-5 [animation-delay:180ms]">
        <input type="hidden" name="role" value={role} />
        <div className="grid grid-cols-2 gap-3">
          <TextField id="first_name" name="first_name" label="First name" placeholder="Ada" autoComplete="given-name" required />
          <TextField id="last_name" name="last_name" label="Last name" placeholder="Obi" autoComplete="family-name" required />
        </div>
        <TextField
          id="signup-email"
          name="email"
          type="email"
          label={isEmployer ? "Work email" : "Email"}
          placeholder={isEmployer ? "you@company.com" : "you@example.com"}
          autoComplete="email"
          spellCheck={false}
          required
        />
        <PasswordField
          id="signup-password"
          name="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          required
          pattern={'(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}'}
          title="At least 8 characters, one uppercase letter and one special character."
          hint="At least 8 characters, with an uppercase letter and a symbol."
        />

        <FormMessage message={message} />

        <div className="pt-2">
          <SubmitButton label={isEmployer ? "Create employer account" : "Create account"} pendingLabel="Creating account…" />
        </div>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupForm />
    </Suspense>
  );
}
