"use client";

import { useState, useTransition } from "react";
import {
  SparklesIcon,
  HelpCircleIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  ThumbsUpIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionScreenCandidate, actionGenerateInterviewQuestions } from "@/app/actions/ai";
import type { CandidateScreeningResult, InterviewQuestion } from "@/lib/ai";
import { cn } from "@/lib/utils";

export function AICandidateScreening({
  jobTitle,
  jobDescription,
  jobRequirements,
  candidateName,
  candidateTitle,
  candidateBio,
  candidateSkills,
  coverLetter,
}: {
  jobTitle: string;
  jobDescription?: string;
  jobRequirements?: string;
  candidateName: string;
  candidateTitle?: string | null;
  candidateBio?: string | null;
  candidateSkills?: string[];
  coverLetter?: string | null;
}) {
  const [screening, setScreening] = useState<CandidateScreeningResult | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [isScreening, startScreening] = useTransition();
  const [isGeneratingQuestions, startGeneratingQuestions] = useTransition();
  const [error, setError] = useState("");

  function handleScreen() {
    setError("");
    startScreening(async () => {
      const res = await actionScreenCandidate({
        jobTitle,
        jobDescription,
        jobRequirements,
        candidateName,
        candidateTitle: candidateTitle || undefined,
        candidateBio: candidateBio || undefined,
        candidateSkills,
        coverLetter: coverLetter || undefined,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to screen candidate.");
        return;
      }

      setScreening(res.data);
    });
  }

  function handleQuestions() {
    setError("");
    startGeneratingQuestions(async () => {
      const res = await actionGenerateInterviewQuestions({
        jobTitle,
        jobRequirements,
        candidateName,
        candidateSkills,
        candidateBio: candidateBio || undefined,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to generate questions.");
        return;
      }

      setQuestions(res.data.questions);
    });
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand/20 bg-linear-to-b from-brand/[0.04] to-transparent p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon icon={SparklesIcon} size={16} />
          </div>
          <h4 className="text-[14px] font-semibold text-neutral-900">AI Screening & Interview Copilot</h4>
        </div>

        {!screening ? (
          <button
            type="button"
            disabled={isScreening}
            onClick={handleScreen}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand px-3.5 text-[12.5px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            {isScreening ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
                Screening…
              </>
            ) : (
              <>
                <Icon icon={SparklesIcon} size={14} />
                Analyze Candidate Fit
              </>
            )}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-[12.5px] text-red-600">{error}</p> : null}

      {screening ? (
        <div className="mt-4 space-y-4 text-[13px]">
          {/* Score & recommendation badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 shadow-xs ring-1 ring-neutral-200">
              <span className="text-[12px] font-medium text-neutral-500">Match Score:</span>
              <span
                className={cn(
                  "text-[15px] font-bold tabular-nums",
                  screening.score >= 80 ? "text-emerald-600" : screening.score >= 60 ? "text-amber-600" : "text-neutral-600"
                )}
              >
                {screening.score}%
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                {screening.grade}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-brand/10 px-3 py-1.5 text-[12px] font-medium text-brand">
              <Icon icon={ThumbsUpIcon} size={14} />
              AI Recommendation: {screening.recommendation}
            </div>
          </div>

          <p className="rounded-xl bg-white/80 p-3 text-neutral-700 ring-1 ring-neutral-100">
            {screening.summary}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-emerald-50/70 p-3 ring-1 ring-emerald-100">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-900">
                <Icon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600" />
                Key Strengths
              </p>
              <ul className="mt-2 space-y-1 text-[12.5px] text-emerald-800">
                {screening.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-100">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-900">
                <Icon icon={AlertCircleIcon} size={14} className="text-amber-600" />
                Areas to Probe
              </p>
              <ul className="mt-2 space-y-1 text-[12.5px] text-amber-800">
                {screening.gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interview Questions Section */}
          <div className="border-t border-neutral-200/60 pt-3">
            {!questions ? (
              <button
                type="button"
                disabled={isGeneratingQuestions}
                onClick={handleQuestions}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12.5px] font-medium text-neutral-800 shadow-xs ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                {isGeneratingQuestions ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-600 border-t-transparent" />
                    Generating Tailored Questions…
                  </>
                ) : (
                  <>
                    <Icon icon={HelpCircleIcon} size={14} className="text-brand" />
                    Generate Tailored Interview Questions
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <h5 className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900">
                  <Icon icon={HelpCircleIcon} size={15} className="text-brand" />
                  Tailored Interview Questions ({questions.length})
                </h5>
                <ul className="space-y-2.5">
                  {questions.map((q, idx) => (
                    <li key={idx} className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-neutral-200/80">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
                          {q.category}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13.5px] font-medium text-neutral-900">{q.question}</p>
                      <p className="mt-1 text-[12px] text-neutral-500">
                        <span className="font-medium text-neutral-600">What to look for: </span>
                        {q.whatToLookFor}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
