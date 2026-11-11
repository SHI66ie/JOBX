"use client";

import { useState, useTransition } from "react";
import {
  SparklesIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  LightbulbIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionAnalyzeJobFit } from "@/app/actions/ai";
import type { JobFitAnalysis } from "@/lib/ai";

export function AIJobFitAdvisor({
  jobTitle,
  companyName,
  jobDescription,
  jobRequirements,
  candidateTitle,
  candidateBio,
  candidateSkills,
  onOpenPitch,
}: {
  jobTitle: string;
  companyName?: string;
  jobDescription?: string;
  jobRequirements?: string;
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
  onOpenPitch?: () => void;
}) {
  const [analysis, setAnalysis] = useState<JobFitAnalysis | null>(null);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, startAnalyzing] = useTransition();

  function handleAnalyze() {
    setError("");
    setIsOpen(true);
    startAnalyzing(async () => {
      const res = await actionAnalyzeJobFit({
        jobTitle,
        companyName,
        jobDescription,
        jobRequirements,
        candidateTitle,
        candidateBio,
        candidateSkills,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to analyze job fit.");
        return;
      }

      setAnalysis(res.data);
    });
  }

  const scoreColor = !analysis
    ? "text-brand"
    : analysis.score >= 85
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : analysis.score >= 70
        ? "text-blue-600 bg-blue-50 border-blue-200"
        : "text-amber-600 bg-amber-50 border-amber-200";

  return (
    <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.04] via-transparent to-transparent p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon icon={SparklesIcon} size={18} />
          </div>
          <div>
            <h3 className="text-[14.5px] font-semibold text-neutral-900">Job Fit & Readiness Advisor</h3>
            <p className="text-[12.5px] text-neutral-500">
              See how your background aligns and get advice on how to stand out.
            </p>
          </div>
        </div>

        {!analysis && !isAnalyzing ? (
          <button
            type="button"
            onClick={handleAnalyze}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-1.5 text-[12.5px] font-medium text-brand-fg transition-colors hover:bg-brand-hover shadow-2xs"
          >
            <Icon icon={SparklesIcon} size={14} />
            Analyze My Fit
          </button>
        ) : null}
      </div>

      {isAnalyzing ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-4 text-[13px] text-neutral-600 shadow-2xs">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <span>Analyzing your CV and skills against the job requirements…</span>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-[13px] text-red-600">{error}</p>
      ) : null}

      {analysis && isOpen ? (
        <div className="mt-4 space-y-4">
          {/* Score & Summary Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[13px] font-bold ${scoreColor}`}>
                  {analysis.score}% Match · {analysis.grade}
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-700">
                {analysis.summary}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Matched Strengths */}
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-700">
                <Icon icon={CheckmarkCircle02Icon} size={17} />
                <h4 className="text-[13px] font-semibold">Your Matching Strengths</h4>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-[12.5px] text-neutral-600">
                {analysis.matchedStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Identified Gaps */}
            <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-700">
                <Icon icon={AlertCircleIcon} size={17} />
                <h4 className="text-[13px] font-semibold">Areas to Address</h4>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-[12.5px] text-neutral-600">
                {analysis.missingGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strategic Advice */}
          <div className="rounded-xl border border-brand/20 bg-brand/[0.03] p-4">
            <div className="flex items-center gap-2 text-brand">
              <Icon icon={LightbulbIcon} size={17} />
              <h4 className="text-[13px] font-semibold">Application Strategy for this Role</h4>
            </div>
            <ul className="mt-2 space-y-2 text-[12.5px] text-neutral-700">
              {analysis.strategicAdvice.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 font-semibold text-brand">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            {onOpenPitch ? (
              <div className="mt-3 border-t border-brand/10 pt-2.5">
                <button
                  type="button"
                  onClick={onOpenPitch}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand hover:underline"
                >
                  Apply this strategy in your AI Pitch
                  <Icon icon={ArrowRight01Icon} size={14} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
