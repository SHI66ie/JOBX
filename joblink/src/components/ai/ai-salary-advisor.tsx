"use client";

import { useState } from "react";
import {
  MoneyBag02Icon,
  ChartBarIncreasingIcon,
  Target02Icon,
  SparklesIcon,
  Copy01Icon,
  CheckIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionAnalyzeSalary } from "@/app/actions/ai";
import type { SalaryBenchmarkResult } from "@/lib/ai";

export type AISalaryAdvisorProps = {
  jobTitle: string;
  companyName?: string;
  jobDescription?: string;
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
};

export function AISalaryAdvisor({
  jobTitle,
  companyName,
  jobDescription,
  candidateTitle,
  candidateBio,
  candidateSkills,
}: AISalaryAdvisorProps) {
  const [data, setData] = useState<SalaryBenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await actionAnalyzeSalary({
        jobTitle,
        companyName,
        jobDescription,
        candidateTitle,
        candidateBio,
        candidateSkills,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setData(res.data);
        setExpanded(true);
      }
    } catch {
      setError("Failed to generate salary benchmark. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function formatSalary(amount: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (!expanded && !data) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-gradient-to-r from-emerald-50/50 via-neutral-50/40 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <Icon icon={MoneyBag02Icon} size={18} />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-neutral-900">
              Salary Benchmark &amp; Negotiation Guide
            </h4>
            <p className="text-[12.5px] text-neutral-500">
              Estimate fair market compensation and get custom negotiation talking points.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 text-[12.5px] font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Icon icon={SparklesIcon} size={13} />
              <span>Analyze Salary</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-200/80 bg-surface text-neutral-900 shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50/40 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-700">
            <Icon icon={MoneyBag02Icon} size={16} />
          </div>
          <h4 className="text-[14px] font-semibold text-neutral-900">
            Salary Benchmark &amp; Negotiation Playbook
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[12px] font-medium text-emerald-700 hover:text-emerald-800"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Estimated Range Visualizer */}
              <div className="rounded-xl bg-neutral-100/50 p-4 border border-neutral-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium text-neutral-500">
                    Estimated Annual Compensation (USD)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                    <Icon icon={Target02Icon} size={12} />
                    {data.marketPosition}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-surface p-2.5 border border-neutral-200/60">
                    <div className="text-[11px] text-neutral-400">Entry / Low</div>
                    <div className="mt-0.5 text-[15px] font-bold text-neutral-800">
                      {formatSalary(data.estimatedRange.low, data.estimatedRange.currency)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-200">
                    <div className="text-[11px] font-semibold text-emerald-700">Market Midpoint</div>
                    <div className="mt-0.5 text-[16px] font-extrabold text-emerald-900">
                      {formatSalary(data.estimatedRange.mid, data.estimatedRange.currency)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface p-2.5 border border-neutral-200/60">
                    <div className="text-[11px] text-neutral-400">Top / High Tier</div>
                    <div className="mt-0.5 text-[15px] font-bold text-neutral-800">
                      {formatSalary(data.estimatedRange.high, data.estimatedRange.currency)}
                    </div>
                  </div>
                </div>

                {/* Factors */}
                {data.factors.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200/60">
                    <span className="text-[11.5px] text-neutral-500 mr-1">Key drivers:</span>
                    {data.factors.map((f, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-surface px-2 py-0.5 text-[11px] text-neutral-600 border border-neutral-200/60"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Negotiation Tips */}
              <div>
                <h5 className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900">
                  <Icon icon={ChartBarIncreasingIcon} size={14} className="text-emerald-600" />
                  Tactical Negotiation Tips
                </h5>
                <ul className="mt-2 space-y-1.5">
                  {data.negotiationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-neutral-700">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ready-to-Use Talking Points */}
              <div>
                <h5 className="text-[13px] font-semibold text-neutral-900">
                  Ready-to-Use Salary Talking Points
                </h5>
                <div className="mt-2 space-y-2">
                  {data.talkingPoints.map((point, i) => (
                    <div
                      key={i}
                      className="group relative flex items-start justify-between rounded-lg bg-neutral-50 p-3 border border-neutral-200/60 text-[12.5px] leading-relaxed text-neutral-700 hover:bg-neutral-100/60 transition"
                    >
                      <p className="pr-8">&ldquo;{point}&rdquo;</p>
                      <button
                        type="button"
                        onClick={() => handleCopy(point, i)}
                        title="Copy talking point"
                        className="absolute right-2.5 top-2.5 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      >
                        <Icon icon={copiedIdx === i ? CheckIcon : Copy01Icon} size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="text-[12px] text-neutral-500 hover:text-emerald-700 transition"
            >
              {loading ? "Re-calculating..." : "↻ Refresh benchmark"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
