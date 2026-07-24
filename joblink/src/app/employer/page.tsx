"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function EmployerLoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // For now, redirect to employer dashboard
    // In production, this would authenticate with Supabase
    window.location.href = "/employer/dashboard";
  };

  return (
    <div className="landing-split flex min-h-screen">
      {/* ===== LEFT PANEL: Branding ===== */}
      <div className="landing-left-panel flex-1 flex flex-col justify-center px-10 lg:px-16 py-12 relative">
        {/* Decorative SVG curvy line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 500 700"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="landing-curve-line"
            d="M-20 350 C80 280, 120 450, 200 380 S350 200, 280 500 S150 650, 250 700"
            stroke="url(#curveGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="50%" stopColor="#00bcd4" />
              <stop offset="100%" stopColor="#ff4081" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating decorative shapes */}
        <div
          className="landing-shape landing-shape-1"
          style={{ top: "12%", right: "18%", width: 44, height: 44 }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44">
            <rect
              x="4"
              y="4"
              width="36"
              height="36"
              rx="10"
              fill="#ff4081"
              opacity="0.9"
            />
          </svg>
        </div>

        <div
          className="landing-shape landing-shape-2"
          style={{ top: "18%", left: "38%", width: 16, height: 16 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="7" fill="#2979ff" opacity="0.85" />
          </svg>
        </div>

        <div
          className="landing-shape landing-shape-4"
          style={{ top: "48%", left: "8%", width: 24, height: 24 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="4"
              fill="#00e5ff"
              opacity="0.8"
            />
          </svg>
        </div>

        <div
          className="landing-shape landing-shape-3"
          style={{ bottom: "15%", left: "12%", width: 48, height: 48 }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48">
            <polygon
              points="24,2 44,14 44,34 24,46 4,34 4,14"
              fill="#ff9100"
              opacity="0.85"
            />
          </svg>
        </div>

        <div
          className="landing-shape landing-shape-5"
          style={{ top: "35%", right: "8%", width: 20, height: 20 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" fill="#f50057" opacity="0.7" />
          </svg>
        </div>

        {/* Branding content */}
        <div className="relative z-10 max-w-md">
          <p
            className="text-sm font-semibold tracking-wider uppercase mb-8"
            style={{ color: "#90a4ae" }}
          >
            Joblink
            <br />
            <span className="font-bold text-white">Employer Portal</span>
          </p>

          <h1
            className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6"
            style={{ color: "#fff" }}
          >
            Find Top Talent
            <br />
            With Joblink
          </h1>

          <p
            className="text-base lg:text-lg leading-relaxed"
            style={{ color: "#90a4ae" }}
          >
            Post jobs, manage applications, and connect with qualified candidates
            through Joblink&apos;s employer platform.
          </p>
        </div>
      </div>

      {/* ===== RIGHT PANEL: Login Form ===== */}
      <div className="flex-1 flex flex-col bg-white min-h-screen">
        {/* Top bar */}
        <div className="flex justify-end px-8 pt-6">
          <span
            className="text-xs border rounded-full px-3 py-1 flex items-center gap-1.5"
            style={{ color: "#555", borderColor: "#ccc" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            English (English)
          </span>
        </div>

        {/* Go back */}
        <div className="px-8 lg:px-16 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
            style={{ color: "#333" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Go back
          </Link>
        </div>

        {/* Form section */}
        <div className="flex-1 flex items-start justify-center px-8 lg:px-16 pt-8 lg:pt-16">
          <div className="w-full max-w-sm">
            <h2
              className="text-3xl font-bold mb-1"
              style={{ color: "#1a1a1a" }}
            >
              Employer Login
            </h2>
            <p className="mb-8" style={{ color: "#666", fontSize: "0.95rem" }}>
              Please{" "}
              <span style={{ color: "#00838f", fontWeight: 500 }}>login</span>{" "}
              as an Employer.
            </p>

            <form action={handleSubmit} className="space-y-5">
              {/* Hidden role field */}
              <input type="hidden" name="role" value="employer" />

              {/* Email */}
              <div>
                <label
                  htmlFor="employer-email"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#444" }}
                >
                  Email
                </label>
                <input
                  id="employer-email"
                  name="email"
                  type="email"
                  required
                  className="landing-input w-full border rounded-md px-3.5 py-2.5 text-sm transition-all duration-200"
                  style={{
                    borderColor: "#ccc",
                    color: "#1a1a1a",
                    backgroundColor: "#fff",
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="employer-password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#444" }}
                >
                  Password
                </label>
                <input
                  id="employer-password"
                  name="password"
                  type="password"
                  required
                  className="landing-input w-full border rounded-md px-3.5 py-2.5 text-sm transition-all duration-200"
                  style={{
                    borderColor: "#ccc",
                    color: "#1a1a1a",
                    backgroundColor: "#fff",
                  }}
                />
              </div>

              {/* Setup or Reset Password */}
              <div className="flex justify-end">
                <Link
                  href="/"
                  className="text-sm font-medium hover:underline"
                  style={{ color: "#00838f" }}
                >
                  Setup or Reset Password
                </Link>
              </div>

              {message && (
                <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                  {message}
                </p>
              )}

              {/* Login button */}
              <button type="submit" className="landing-login-btn" style={{ backgroundColor: "#3b82f6" }}>
                Login to Employer Portal
              </button>
            </form>

            {/* Divider */}
            <div className="landing-divider">Or continue with</div>

            {/* Sign up link */}
            <div
              className="mt-10 pt-6 text-center text-sm"
              style={{ borderTop: "1px solid #eee", color: "#555" }}
            >
              Don&apos;t have an employer account?{" "}
              <Link
                href="/signup?role=employer"
                className="font-semibold hover:underline"
                style={{ color: "#3b82f6" }}
              >
                Create Employer Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmployerLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <EmployerLoginForm />
    </Suspense>
  );
}
