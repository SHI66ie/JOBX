"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cancel01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/utils/supabase/client";

type Arrival = { id: string; jobId: string; jobTitle: string | null };

const VISIBLE_MS = 7000;

/**
 * Listens for new applications on this employer's jobs (realtime applies the same RLS as reads),
 * refreshes whatever page is open so lists and counts update in place, and shows a quiet toast.
 */
export function LiveApplications({ userId }: { userId: string }) {
  const router = useRouter();
  const [arrival, setArrival] = useState<Arrival | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`employer-applications-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "applications" }, async (payload) => {
        const row = payload.new as { id: string; job_id: string };
        router.refresh();
        const { data } = await supabase.from("jobs").select("title").eq("id", row.job_id).maybeSingle();
        setArrival({ id: row.id, jobId: row.job_id, jobTitle: data?.title ?? null });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, userId]);

  useEffect(() => {
    if (!arrival) return;
    const timer = window.setTimeout(() => setArrival(null), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [arrival]);

  if (!arrival) return null;

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex justify-end sm:inset-x-6 sm:bottom-6">
      <div
        key={arrival.id}
        className="auth-rise pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-surface py-3 pl-3.5 pr-2 shadow-[0_1px_2px_rgba(1,34,79,0.06),0_12px_32px_-12px_rgba(1,34,79,0.35)] ring-1 ring-neutral-200/70"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/[0.07] text-brand">
          <Icon icon={UserAdd01Icon} size={17} className="auth-pop" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium text-neutral-900">New application</p>
          <p className="truncate text-[12.5px] text-neutral-500">{arrival.jobTitle ? `For ${arrival.jobTitle}` : "Just now"}</p>
        </div>
        <Link
          href={`/employer/jobs/${arrival.jobId}?review=${arrival.id}#${arrival.id}`}
          onClick={() => setArrival(null)}
          className="rounded-full px-3 py-1.5 text-[13px] font-medium text-brand transition-colors hover:bg-brand/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          View
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setArrival(null)}
          className="flex size-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Icon icon={Cancel01Icon} size={15} />
        </button>
      </div>
    </div>
  );
}
