"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { login, signInWithGoogle } from "./actions";
import { APP_NAME } from "@/lib/config";
import { Logo } from "@/components/brand/logo";

function LoginFormInner() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="landing-split flex min-h-screen">
      <div className="landing-left-panel flex-1 flex flex-col justify-center px-10 lg:px-16 py-12 relative">
        <div className="relative z-10 max-w-md">
          <div className="mb-8">
            <Logo variant="lockup" tone="white" tagline markClassName="h-10 w-10" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-white">
            Build Your Career
            <br />
            With {APP_NAME}
          </h1>

          <p className="text-base lg:text-lg leading-relaxed text-white/70">
            Pursue real career paths through employer-posted positions, connect
            with top companies, and access free tools backed by {APP_NAME}'s
            expertise.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white min-h-screen">
        <div className="flex-1 flex items-start justify-center px-8 lg:px-16 pt-16">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-1 text-[#111111]">Welcome!</h2>
            <p className="mb-8 text-[#111111]/70 text-[0.95rem]">
              Please <span className="font-medium text-[#01224F]">login</span> to continue.
            </p>

            <form action={login} className="space-y-5">
              <div>
                <label htmlFor="landing-email" className="block text-sm font-medium mb-1.5 text-[#111111]">
                  Email
                </label>
                <input
                  id="landing-email"
                  name="email"
                  type="email"
                  required
                  className="landing-input w-full border rounded-md px-3.5 py-2.5 text-sm text-[#111111] bg-white border-[#ccc]"
                />
              </div>

              <div>
                <label htmlFor="landing-password" className="block text-sm font-medium mb-1.5 text-[#111111]">
                  Password
                </label>
                <input
                  id="landing-password"
                  name="password"
                  type="password"
                  required
                  className="landing-input w-full border rounded-md px-3.5 py-2.5 text-sm text-[#111111] bg-white border-[#ccc]"
                />
              </div>

              <div className="flex justify-end">
                <Link href="/" className="text-sm font-medium hover:underline text-[#01224F]">
                  Forgot password?
                </Link>
              </div>

              {message && (
                <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                  {message}
                </p>
              )}

              <button type="submit" className="landing-login-btn">
                Login
              </button>
            </form>

            <div className="landing-divider">Or continue with</div>

            <form action={signInWithGoogle} className="flex justify-center">
              <button type="submit" className="landing-google-btn">
                Google
              </button>
            </form>

            <div className="mt-10 pt-6 text-center text-sm border-t border-[#eee] text-[#111111]/70">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold hover:underline text-[#01224F]">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
