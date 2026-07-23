"use client";

import Link from "next/link";
import { useState } from "react";
import { login } from "./login/actions";

export default function Home() {
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
            <span className="font-bold text-white">Career Platform</span>
          </p>

          <h1
            className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6"
            style={{ color: "#fff" }}
          >
            Build Your Career
            <br />
            With Joblink
          </h1>

          <p
            className="text-base lg:text-lg leading-relaxed"
            style={{ color: "#90a4ae" }}
          >
            Pursue real career paths through employer-posted positions, connect
            with top companies, and access free tools backed by Joblink&apos;s
            expertise.
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
              Welcome!
            </h2>
            <p className="mb-8" style={{ color: "#666", fontSize: "0.95rem" }}>
              Please{" "}
              <span style={{ color: "#00838f", fontWeight: 500 }}>login</span>{" "}
              as a Job Seeker.
            </p>

            <form action={login} className="space-y-5">
              {/* Hidden role field if needed by backend actions */}
              <input type="hidden" name="role" value="candidate" />

              {/* Email */}
              <div>
                <label
                  htmlFor="landing-email"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#444" }}
                >
                  Email
                </label>
                <input
                  id="landing-email"
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
                  htmlFor="landing-password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#444" }}
                >
                  Password
                </label>
                <input
                  id="landing-password"
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
                  href="/login"
                  className="text-sm font-medium hover:underline"
                  style={{ color: "#00838f" }}
                >
                  Setup or Reset Password
                </Link>
              </div>

              {/* Login button */}
              <button type="submit" className="landing-login-btn">
                Login
              </button>
            </form>

            {/* Divider */}
            <div className="landing-divider">Or continue with</div>

            {/* Google button */}
            <div className="flex justify-center">
              <button type="button" className="landing-google-btn">
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Google
              </button>
            </div>

            {/* Sign up link */}
            <div
              className="mt-10 pt-6 text-center text-sm"
              style={{ borderTop: "1px solid #eee", color: "#555" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold hover:underline"
                style={{ color: "#1a1a1a" }}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
