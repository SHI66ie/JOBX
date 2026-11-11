"use client";

import { useState } from "react";
import {
  ShieldCheckIcon,
  CheckIcon,
  SparklesIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionAuditJobInclusivity } from "@/app/actions/ai";
import type { InclusivityAuditResult } from "@/lib/ai";

export type AIInclusivityAuditProps = {
  jobTitle: string;
  description?: string;
  requirements?: string;
};

export function AIInclusivityAudit({
  jobTitle,
  description,
  requirements,
}: AIInclusivityAuditProps) {
  const [data, setData] = useState<InclusivityAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function handleAudit() {
    setLoading(true);
    setError(null);
    try {
      const res = await actionAuditJobInclusivity({
        jobTitle,
        description,
        requirements,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setData(res.data);
        setIsOpen(true);
      }
    } catch {
      setError("Failed to run inclusivity audit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 90) return "text-emerald-700 bg-emerald-100/70 border-emerald-200";
    if (score >= 80) return "text-blue-700 bg-blue-100/70 border-blue-200";
    if (score >= 70) return "text-amber-700 bg-amber-100/70 border-amber-200";
    return "text-rose-700 bg-rose-100/70 border-rose-200";
  }

  function severityBadge(severity: "high" | "medium" | "low") {
    if (severity === "high") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (severity === "medium") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }

  if (!isOpen && !data) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-neutral-50/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
            <Icon icon={ShieldCheckIcon} size={18} />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-neutral-900">
              Job Inclusivity &amp; Clarity Audit
            </h4>
            <p className="text-[12.5px] text-neutral-500">
              Scan your job post for gendered bias, credential inflation, and appeal to diverse applicants.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAudit}
          disabled={loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-surface px-3.5 text-[12.5px] font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-100 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-800" />
              <span>Auditing...</span>
            </>
          ) : (
            <>
              <Icon icon={SparklesIcon} size={13} className="text-indigo-600" />
              <span>Run Audit</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-surface text-neutral-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200/80 bg-neutral-100/50 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600">
            <Icon icon={ShieldCheckIcon} size={16} />
          </div>
          <h4 className="text-[14px] font-semibold text-neutral-900">
            Inclusivity &amp; Readability Audit
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[12px] font-medium text-neutral-500 hover:text-neutral-800"
        >
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {isOpen && (
        <div className="p-5 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Score header */}
              <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4 border border-neutral-100">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Inclusivity Score
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[28px] font-extrabold tracking-tight text-neutral-900">
                      {data.overallScore}
                    </span>
                    <span className="text-[14px] text-neutral-400">/ 100</span>
                    <span
                      className={`ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${scoreColor(
                        data.overallScore
                      )}`}
                    >
                      {data.grade}
                    </span>
                  </div>
                </div>
                <p className="max-w-md text-[13px] leading-relaxed text-neutral-600 text-right">
                  {data.summary}
                </p>
              </div>

              {/* Positives */}
              {data.positives.length > 0 && (
                <div>
                  <h5 className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-800">
                    <Icon icon={CheckIcon} size={15} />
                    Inclusive Strengths
                  </h5>
                  <ul className="mt-2 space-y-1.5">
                    {data.positives.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-neutral-700">
                        <span className="text-emerald-600">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues / Recommendations */}
              <div>
                <h5 className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900">
                  <Icon icon={AlertCircleIcon} size={15} className="text-amber-600" />
                  Areas to Optimize ({data.issues.length})
                </h5>
                <div className="mt-2.5 space-y-2.5">
                  {data.issues.map((iss, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-neutral-200/70 bg-neutral-50/50 p-3 text-[13px]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide border ${severityBadge(
                            iss.severity
                          )}`}
                        >
                          {iss.severity} priority
                        </span>
                        <span className="font-medium text-neutral-900">
                          {iss.category}
                        </span>
                      </div>
                      <div className="mt-1.5 text-[12.5px] text-neutral-600">
                        <span className="font-semibold text-neutral-700">Flagged: </span>
                        &ldquo;{iss.text}&rdquo;
                      </div>
                      <div className="mt-1 text-[12.5px] text-emerald-700 bg-emerald-50/60 p-2 rounded border border-emerald-100">
                        <span className="font-semibold text-emerald-900">Suggestion: </span>
                        {iss.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleAudit}
              disabled={loading}
              className="text-[12px] text-neutral-500 hover:text-indigo-600 transition"
            >
              {loading ? "Scanning..." : "↻ Re-run audit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
