"use client";

import { useState, useTransition } from "react";
import { updateApplicationStatus } from "@/app/employer/actions";
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
