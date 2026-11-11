"use client";

import { useState, useTransition } from "react";
import {
  SparklesIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  UserGroupIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionRankJobApplicants } from "@/app/actions/ai";
import type { ApplicantForRanking, RankedApplicant } from "@/lib/ai";

export function AIApplicantRanker({
  jobTitle,
  jobRequirements,
  applicants,
}: {
  jobTitle: string;
  jobRequirements?: string;
  applicants: ApplicantForRanking[];
}) {
  const [open, setOpen] = useState(false);
  const [rankedList, setRankedList] = useState<RankedApplicant[]>([]);
  const [error, setError] = useState("");
  const [isRanking, startRanking] = useTransition();

  function handleStartRanking() {
    setOpen(true);
    setError("");
    if (!rankedList.length) {
      startRanking(async () => {
        const res = await actionRankJobApplicants({
          jobTitle,
          jobRequirements,
          applicants,
        });

        if (res.error || !res.data) {
          setError(res.error || "Failed to rank applicants.");
          return;
        }

        setRankedList(res.data.ranked);
      });
    }
  }

  const applicantMap = new Map(applicants.map((a) => [a.id, a]));

  return (
    <>
      <button
        type="button"
        disabled={!applicants.length}
        onClick={handleStartRanking}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand/30 bg-brand/[0.06] px-4 text-[13px] font-medium text-brand transition-colors hover:bg-brand/[0.12] disabled:opacity-50"
      >
        <Icon icon={SparklesIcon} size={15} />
        AI Rank & Shortlist ({applicants.length})
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-900/50 p-4 backdrop-blur-xs">
          <div className="relative my-8 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon icon={UserGroupIcon} size={20} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-neutral-900">AI Applicant Ranking & Shortlist</h3>
                  <p className="text-[13px] text-neutral-500">
                    Semantically ranked candidates for {jobTitle} based on skill match and qualifications.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <Icon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isRanking ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <p className="mt-3 text-[14px] font-medium text-neutral-800">Screening and ranking candidates…</p>
                  <p className="text-[12.5px] text-neutral-500">Comparing qualifications against your job requirements.</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center">
                  <p className="text-[13.5px] text-red-600">{error}</p>
                </div>
              ) : rankedList.length ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-neutral-500">
                      Found {rankedList.filter((r) => r.tier === "Top Pick").length} Top Pick candidates
                    </p>
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-medium text-brand">
                      Ranked by Compatibility
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                    {rankedList.map((ranked, index) => {
                      const candidate = applicantMap.get(ranked.id);
                      if (!candidate) return null;

                      const tierBadge =
                        ranked.tier === "Top Pick"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : ranked.tier === "Strong Potential"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-neutral-50 text-neutral-600 border-neutral-200";

                      return (
                        <div key={ranked.id} className="p-4 transition-colors hover:bg-neutral-50/60">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-[12px] font-bold text-neutral-600">
                                #{index + 1}
                              </span>
                              <div>
                                <h4 className="text-[14.5px] font-semibold text-neutral-900">{candidate.name}</h4>
                                <p className="text-[12px] text-neutral-500">{candidate.title || "Applicant"}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`rounded-lg border px-2.5 py-1 text-[12px] font-bold ${tierBadge}`}>
                                {ranked.score}% · {ranked.tier}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-[12.5px]">
                            <div className="flex items-start gap-1.5 text-neutral-700">
                              <Icon icon={CheckmarkCircle02Icon} size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                              <span>{ranked.standoutReason}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-neutral-500">
                              <Icon icon={AlertCircleIcon} size={15} className="mt-0.5 shrink-0 text-amber-600" />
                              <span>{ranked.potentialRiskOrGap}</span>
                            </div>
                          </div>

                          {candidate.skills?.length ? (
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {candidate.skills.slice(0, 6).map((sk) => (
                                <span key={sk} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end border-t border-neutral-100 bg-neutral-50/50 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Close Shortlist
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
