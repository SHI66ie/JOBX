"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signup, signInWithGoogle } from "../login/actions";
import { APP_NAME } from "@/lib/config";
import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/brand/social-links";

function SignupForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const role = searchParams.get("role") === "employer" ? "employer" : "candidate";
  const isEmployer = role === "employer";

  return (
    <div className="landing-split flex min-h-screen">
      <div className="landing-left-panel flex-1 flex flex-col justify-center px-10 lg:px-16 py-12 relative">
        <div className="relative z-10 max-w-md">
          <div className="mb-8">
            <Logo variant="lockup" tone="white" tagline markClassName="h-10 w-10" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-white">
            {isEmployer ? (
              <>
                Hire Top Talent
                <br />
                Faster
              </>
            ) : (
              <>
                Join the Network
                <br />
                Start Today
              </>
            )}
          </h1>
          <p className="text-base lg:text-lg leading-relaxed text-white/70">
            {isEmployer
              ? "Create your employer account to post jobs, manage applications, and connect with qualified candidates."
              : `Create your account to browse jobs, apply easily, and build valuable connections within the ${APP_NAME} ecosystem.`}
          </p>
          <div className="mt-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-white/55">Follow @jomponline</p>
            <SocialLinks />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white min-h-screen">
        <div className="px-8 lg:px-16 pt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#111111] hover:opacity-70">
            ← Go back
          </Link>
        </div>
        <div className="flex-1 flex items-start justify-center px-8 lg:px-16 pt-8">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-1 text-[#111111]">Sign Up</h2>
            <p className="mb-4 text-[#111111]/70 text-[0.95rem]">
              Create your account as an{" "}
              <span className="font-medium text-[#01224F]">{isEmployer ? "Employer" : "Applicant"}</span>.
            </p>
            <div className="mb-6">
              <Link
                href={isEmployer ? "/signup" : "/signup?role=employer"}
                className="inline-flex items-center justify-center w-full border border-dashed rounded-md px-4 py-2.5 text-sm font-medium border-[#01224F] text-[#01224F] hover:bg-[#01224F]/5"
              >
                {isEmployer ? "Looking for a job? Register as an Applicant →" : "Looking to hire? Register as an Employer →"}
              </Link>
            </div>
            <form action={signup} className="space-y-5">
              <input type="hidden" name="role" value={role} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium mb-1.5 text-[#111111]">First Name</label>
                  <input id="first_name" name="first_name" type="text" required placeholder="John" className="landing-input w-full border rounded-md px-3.5 py-2.5 text-sm text-[#111111] bg-white border-[#ccc]" />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium mb-1.5 text-[#111111]">Last Name</label>
                  <input id="last_name" name="last_name" type="text" required placeholder="Doe" className="landing-input w-full border rounded-md px-3.5 py-2.5 text-sm text-[#111111] bg-white border-[#ccc]" />
                </div>
              </div>
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5 text-[#111111]">Email</label>
                <input id="signup-email" name="email" type="email" required placeholder="m@example.com" className="landing-input w-full border rounded-md px-3.5 py-2.5 text-sm text-[#111111] bg-white border-[#ccc]" />
              </div>
              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5 text-[#111111]">Password</label>
                <input id="signup-password" name="password" type="password" required pattern='(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}' title="Must contain at least one uppercase letter and one special character." className="landing-input w-full border rounded-md px-3.5 py-2.5 text-sm text-[#111111] bg-white border-[#ccc]" />
                <p className="text-xs text-[#111111]/60 mt-1.5">Password must contain at least one uppercase letter and one special character.</p>
              </div>
              {message && (
                <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{message}</p>
              )}
              <button type="submit" className="landing-login-btn">
                {isEmployer ? "Create Employer Account" : "Sign up"}
              </button>
            </form>
            <div className="landing-divider">Or continue with</div>
            <form action={signInWithGoogle} className="flex justify-center">
              <input type="hidden" name="role" value={role} />
              <button type="submit" className="landing-google-btn">Google</button>
            </form>
            <div className="mt-10 pt-6 text-center text-sm border-t border-[#eee] text-[#111111]/70">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold hover:underline text-[#01224F]">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
