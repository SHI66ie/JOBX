"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { startOnboardingRole } from "@/app/onboarding/actions";

export default function WelcomeOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const [open, setOpen] = useState(welcome);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const user = data.user;
      if (!user) return;

      const first = user.user_metadata?.first_name || user.user_metadata?.full_name || user.email || "";
      setName(String(first).split(" ")[0]);

      if (!user.user_metadata?.onboarded) {
        setOpen(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function choose(role: "employer" | "candidate") {
    setLoading(true);
    setError(null);
    try {
      const result = await startOnboardingRole(role);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not start onboarding.");
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#01224F]/55 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.18em] text-[#01224F]">
          Welcome{name ? `, ${name}` : ""}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#01224F]">Finish setting up your account</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#111111]/70">
          You signed in with Google. Choose how you want to use JOMP and we will start onboarding.
        </p>
        {error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => choose("candidate")}
            className="rounded-xl border border-[#01224F]/15 bg-white px-4 py-4 text-left hover:border-[#01224F] disabled:opacity-60"
          >
            <span className="block font-semibold text-[#01224F]">I am an applicant</span>
            <span className="mt-1 block text-sm text-[#111111]/70">Find work and apply to jobs.</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => choose("employer")}
            className="rounded-xl bg-[#01224F] px-4 py-4 text-left text-white hover:opacity-95 disabled:opacity-60"
          >
            <span className="block font-semibold">I am an employer</span>
            <span className="mt-1 block text-sm text-white/70">Post jobs and hire talent.</span>
          </button>
        </div>
        <p className="mt-4 text-xs text-[#111111]/50">
          {loading ? "Starting onboarding…" : "You can add the other role later from settings."}
        </p>
      </div>
    </div>
  );
}
