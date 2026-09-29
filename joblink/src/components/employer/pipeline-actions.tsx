"use client";

import { useState, useTransition } from "react";
import { deleteJob, setJobStatus, updateApplicationStatus } from "@/app/employer/actions";
import { nextMoves, type ApplicationStatus } from "@/lib/applications";
import { cn } from "@/lib/utils";

/** One-click stage moves for an applicant. */
export function StageActions({ applicationId, jobId, status }: { applicationId: string; jobId: string; status: ApplicationStatus }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <div className={cn("flex flex-wrap gap-1.5", isPending && "pointer-events-none opacity-60")}>
        {nextMoves(status).map((move) => (
          <button
            key={move.status}
            type="button"
            onClick={() =>
              startTransition(async () => {
                setError("");
                try {
                  await updateApplicationStatus(applicationId, move.status, jobId);
                } catch {
                  setError("Couldn't update. Try again.");
                }
              })
            }
            className={cn(
              "h-8 rounded-full px-3 text-[12.5px] font-medium transition-colors",
              move.tone === "positive" && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              move.tone === "negative" && "text-neutral-500 hover:bg-red-50 hover:text-red-700",
              move.tone === "default" && "bg-neutral-100 text-neutral-800 hover:bg-neutral-200/70",
            )}
          >
            {move.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
    </div>
  );
}

/** Close / reopen / delete controls for a job listing. */
export function JobActions({ jobId, isOpen }: { jobId: string; isOpen: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      setError("");
      try {
        await action();
      } catch (err) {
        // redirect() after delete surfaces as a thrown NEXT_REDIRECT; let it through.
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
        setError("Something went wrong. Try again.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <div className={cn("flex flex-wrap items-center gap-1.5", isPending && "pointer-events-none opacity-60")}>
        <button
          type="button"
          onClick={() => run(() => setJobStatus(jobId, isOpen ? "closed" : "published"))}
          className="h-9 rounded-full bg-neutral-100 px-4 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-200/70"
        >
          {isOpen ? "Close listing" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Delete this job and all its applications? This can't be undone.")) run(() => deleteJob(jobId));
          }}
          className="h-9 rounded-full px-3 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </button>
      </div>
      {error ? <p className="text-[12px] text-red-600">{error}</p> : null}
    </div>
  );
}
