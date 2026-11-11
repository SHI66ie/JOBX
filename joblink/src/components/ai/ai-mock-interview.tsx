"use client";

import { useState, useTransition } from "react";
import {
  SparklesIcon,
  Cancel01Icon,
  Mic01Icon,
  CheckmarkCircle02Icon,
  LightbulbIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionGenerateInterviewQuestions, actionEvaluateInterviewAnswer } from "@/app/actions/ai";
import type { InterviewQuestion, MockInterviewCritique } from "@/lib/ai";

export function AIMockInterview({
  jobTitle,
  jobRequirements,
  candidateName,
  candidateSkills,
}: {
  jobTitle: string;
  jobRequirements?: string;
  candidateName?: string;
  candidateSkills?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState("");
  const [critique, setCritique] = useState<MockInterviewCritique | null>(null);
  const [error, setError] = useState("");

  const [isLoadingQuestions, startLoadingQuestions] = useTransition();
  const [isCritiquing, startCritiquing] = useTransition();

  function handleOpen() {
    setOpen(true);
    setError("");
    if (!questions.length) {
      startLoadingQuestions(async () => {
        const res = await actionGenerateInterviewQuestions({
          jobTitle,
          jobRequirements,
          candidateName,
          candidateSkills,
        });

        if (res.error || !res.data) {
          setError(res.error || "Failed to load interview questions.");
          return;
        }

        setQuestions(res.data.questions);
      });
    }
  }

  function handleCritique() {
    if (!candidateAnswer.trim() || !questions[selectedIdx]) return;
    setError("");
    startCritiquing(async () => {
      const res = await actionEvaluateInterviewAnswer({
        jobTitle,
        question: questions[selectedIdx].question,
        candidateAnswer,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to evaluate answer.");
        return;
      }

      setCritique(res.data);
    });
  }

  function handleSelectQuestion(idx: number) {
    setSelectedIdx(idx);
    setCandidateAnswer("");
    setCritique(null);
    setError("");
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-surface px-3.5 text-[12.5px] font-medium text-neutral-800 transition-colors hover:bg-neutral-100 shadow-2xs"
      >
        <Icon icon={Mic01Icon} size={15} className="text-brand" />
        Practice Interview
      </button>

      {open ? (
        <div className="app-theme fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-950/60 p-4 backdrop-blur-xs">
          <div className="relative my-8 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-neutral-200/80 bg-surface text-neutral-900 shadow-2xl ring-1 ring-black/10">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon icon={Mic01Icon} size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-neutral-900">AI Mock Interview Practice</h3>
                  <p className="text-[12.5px] text-neutral-500">
                    Simulate real interview questions for {jobTitle} and get instant coaching.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <Icon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isLoadingQuestions ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  <p className="mt-3 text-[13.5px] font-medium text-neutral-800">Generating role-specific questions…</p>
                  <p className="text-[12px] text-neutral-500">Tailoring technical & behavioral scenarios for {jobTitle}.</p>
                </div>
              ) : questions.length ? (
                <div className="space-y-5">
                  {/* Question selector tabs */}
                  <div>
                    <label className="text-[12.5px] font-medium text-neutral-500">Select Question to Practice:</label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {questions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectQuestion(idx)}
                          className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                            selectedIdx === idx
                              ? "bg-brand text-brand-fg"
                              : "border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          Q{idx + 1}: {q.category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Question Card */}
                  <div className="rounded-xl border border-brand/20 bg-brand/[0.04] p-4">
                    <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                      {questions[selectedIdx].category}
                    </span>
                    <h4 className="mt-2 text-[15px] font-semibold text-neutral-900 leading-snug">
                      &ldquo;{questions[selectedIdx].question}&rdquo;
                    </h4>
                    <p className="mt-2 text-[12px] text-neutral-500">
                      <span className="font-medium text-neutral-700">What interviewers look for:</span>{" "}
                      {questions[selectedIdx].whatToLookFor}
                    </p>
                  </div>

                  {/* Candidate Answer input */}
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800">
                      Your Practice Answer
                    </label>
                    <textarea
                      rows={4}
                      value={candidateAnswer}
                      onChange={(e) => setCandidateAnswer(e.target.value)}
                      placeholder="Type your response as you would explain it to the hiring manager..."
                      className="mt-1.5 w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 focus:bg-surface p-3 text-[13px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[12px] text-neutral-400">
                        Tip: Use the STAR method (Situation, Task, Action, Result)
                      </span>
                      <button
                        type="button"
                        disabled={isCritiquing || !candidateAnswer.trim()}
                        onClick={handleCritique}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[12.5px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-50"
                      >
                        {isCritiquing ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
                            Evaluating…
                          </>
                        ) : (
                          <>
                            <Icon icon={SparklesIcon} size={14} />
                            Critique My Answer
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {error ? <p className="text-[13px] text-red-600">{error}</p> : null}

                  {/* AI Critique Results */}
                  {critique ? (
                    <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
                      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[13px] font-bold text-emerald-800">
                            Score: {critique.score}/10 · {critique.rating}
                          </span>
                        </div>
                        <span className="text-[12px] text-neutral-500">AI Interview Feedback</span>
                      </div>

                      <p className="text-[13px] leading-relaxed text-neutral-700">
                        {critique.feedback}
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-neutral-200/80 bg-surface p-3">
                          <h5 className="text-[12px] font-semibold text-emerald-700">Strengths</h5>
                          <ul className="mt-1.5 space-y-1 text-[12px] text-neutral-600">
                            {critique.strengths.map((s, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-500 font-bold">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-lg border border-neutral-200/80 bg-surface p-3">
                          <h5 className="text-[12px] font-semibold text-amber-700">Areas to Improve</h5>
                          <ul className="mt-1.5 space-y-1 text-[12px] text-neutral-600">
                            {critique.improvements.map((imp, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{imp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="rounded-lg border border-brand/20 bg-brand/[0.04] p-3">
                        <div className="flex items-center gap-1.5 text-brand">
                          <Icon icon={LightbulbIcon} size={15} />
                          <h5 className="text-[12px] font-semibold">Model STAR Answer Example</h5>
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-700">
                          {critique.suggestedSTARAnswer}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-center text-[13px] text-neutral-500 py-8">
                  {error || "Unable to load interview questions."}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 justify-end border-t border-neutral-200/80 bg-neutral-100/50 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-neutral-200/80 bg-surface px-4 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
              >
                Done Practicing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
