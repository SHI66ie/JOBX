"use client";

import { useState, useTransition } from "react";
import {
  SparklesIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Tick02Icon,
  DocumentCodeIcon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionArrangeCV } from "@/app/actions/ai";
import { updateCandidateProfile } from "@/app/dashboard/actions";
import type { ArrangedCVResult } from "@/lib/ai";
import type { CandidateProfile } from "@/lib/profile";

export function AICVArranger({
  initialProfile,
  onProfileUpdated,
  triggerClassName,
  label = "Arrange CV with AI",
}: {
  initialProfile: CandidateProfile;
  onProfileUpdated?: (updated: CandidateProfile) => void;
  triggerClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [targetNiche, setTargetNiche] = useState("");
  const [rawText, setRawText] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "markdown">("overview");
  const [result, setResult] = useState<ArrangedCVResult | null>(null);
  const [error, setError] = useState("");
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const [isArranging, startArranging] = useTransition();
  const [isApplying, startApplying] = useTransition();

  function handleOpen() {
    setError("");
    setAppliedSuccess(false);
    if (!rawText && initialProfile.bio) {
      setRawText(`Current Title: ${initialProfile.title}\n\nSummary:\n${initialProfile.bio}\n\nSkills:\n${initialProfile.skills.join(", ")}`);
    }
    if (!targetNiche && initialProfile.title) {
      setTargetNiche(initialProfile.title);
    }
    setOpen(true);
  }

  function handleArrange() {
    setError("");
    startArranging(async () => {
      const res = await actionArrangeCV({
        rawCVText: rawText,
        currentTitle: initialProfile.title,
        currentBio: initialProfile.bio,
        skills: initialProfile.skills,
        targetNiche: targetNiche || initialProfile.title,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to arrange CV. Please try again.");
        return;
      }

      setResult(res.data);
    });
  }

  function handleApplyToProfile() {
    if (!result) return;
    setError("");
    startApplying(async () => {
      const mergedSkills = Array.from(
        new Set([...initialProfile.skills, ...(result.recommendedSkills || [])]),
      );

      const nextProfile: CandidateProfile = {
        ...initialProfile,
        title: result.suggestedTitle || initialProfile.title,
        bio: result.executiveSummary || initialProfile.bio,
        skills: mergedSkills,
      };

      const saveRes = await updateCandidateProfile(nextProfile);
      if (saveRes?.error) {
        setError(saveRes.error);
        return;
      }

      setAppliedSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(nextProfile);
      }
    });
  }

  function handleCopyMarkdown() {
    if (!result?.formattedMarkdown) return;
    navigator.clipboard.writeText(result.formattedMarkdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  }

  function handleCopySummary() {
    if (!result?.executiveSummary) return;
    navigator.clipboard.writeText(result.executiveSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={
          triggerClassName ||
          "inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/[0.08] px-4 py-2 text-[13px] font-semibold text-brand transition-all hover:bg-brand/[0.15] hover:shadow-sm"
        }
      >
        <Icon icon={SparklesIcon} size={16} className="text-brand" />
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-900/50 p-4 backdrop-blur-xs">
          <div className="relative my-8 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon icon={SparklesIcon} size={22} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-neutral-900">AI CV Arranger & Niche Optimizer</h3>
                  <p className="text-[13px] text-neutral-500">
                    Structure your CV, extract key niche skills, and optimize for remote recruiter search.
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

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-700">
                  {error}
                </div>
              ) : null}

              {/* Input step */}
              <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800">Target Niche or Specialty</label>
                    <input
                      type="text"
                      value={targetNiche}
                      onChange={(e) => setTargetNiche(e.target.value)}
                      placeholder="e.g. Next.js Full-Stack, B2B SaaS Growth, Mobile React Native"
                      className="mt-1 h-9.5 w-full rounded-lg border border-neutral-300 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-neutral-800">Current Role Title</label>
                    <input
                      type="text"
                      defaultValue={initialProfile.title}
                      placeholder="e.g. Software Engineer"
                      className="mt-1 h-9.5 w-full rounded-lg border border-neutral-300 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-neutral-800">
                    Paste Raw CV, Experience Notes, or Job History
                  </label>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste your resume draft, past responsibilities, projects, or rough notes here..."
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white p-3 text-[13px] leading-5 text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-neutral-500">
                    AI will re-structure sections into action-oriented STAR bullets and categorize your skills.
                  </p>
                  <button
                    type="button"
                    disabled={isArranging}
                    onClick={handleArrange}
                    className="inline-flex h-9.5 items-center gap-1.5 rounded-lg bg-brand px-4 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    {isArranging ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
                        Arranging CV…
                      </>
                    ) : (
                      <>
                        <Icon icon={SparklesIcon} size={15} />
                        Arrange & Structure
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Arranged Results */}
              {result ? (
                <div className="mt-6 space-y-6">
                  {/* Results Subtabs */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          activeTab === "overview"
                            ? "bg-brand text-brand-fg"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <Icon icon={DashboardSquare01Icon} size={14} />
                        Structured Overview
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("markdown")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                          activeTab === "markdown"
                            ? "bg-brand text-brand-fg"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <Icon icon={DocumentCodeIcon} size={14} />
                        Markdown CV
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeTab === "markdown" ? (
                        <button
                          type="button"
                          onClick={handleCopyMarkdown}
                          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          <Icon icon={copiedMd ? Tick02Icon : Copy01Icon} size={13} />
                          {copiedMd ? "Copied" : "Copy Markdown"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {activeTab === "overview" ? (
                    <div className="space-y-5">
                      {/* Niche & Title Card */}
                      <div className="rounded-xl border border-brand/20 bg-brand/[0.03] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                              Target Niche: {result.targetNiche}
                            </span>
                            <h4 className="mt-1 text-[16px] font-bold text-neutral-900">{result.suggestedTitle}</h4>
                          </div>
                        </div>

                        <div className="mt-3 border-t border-brand/15 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-medium text-neutral-500">Executive Remote Summary</span>
                            <button
                              type="button"
                              onClick={handleCopySummary}
                              className="text-[11.5px] font-medium text-brand hover:underline"
                            >
                              {copiedSummary ? "Copied!" : "Copy Summary"}
                            </button>
                          </div>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-700">
                            {result.executiveSummary}
                          </p>
                        </div>
                      </div>

                      {/* Categorized Skills */}
                      <div>
                        <h4 className="text-[14px] font-semibold text-neutral-900">Categorized Skills Matrix</h4>
                        <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                          {Object.entries(result.skillsByCategory || {}).map(([category, items]) => (
                            <div key={category} className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs">
                              <h5 className="text-[12.5px] font-semibold text-neutral-800">{category}</h5>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {items.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-md bg-neutral-100 px-2 py-0.5 text-[12px] font-medium text-neutral-700"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience Highlights */}
                      {result.structuredExperience?.length ? (
                        <div>
                          <h4 className="text-[14px] font-semibold text-neutral-900">Experience & Achievements (STAR Bullets)</h4>
                          <div className="mt-2.5 space-y-3">
                            {result.structuredExperience.map((item, idx) => (
                              <div key={idx} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-[14px] font-semibold text-neutral-900">{item.role}</h5>
                                  <span className="text-[12px] text-neutral-400">{item.period || item.company}</span>
                                </div>
                                <ul className="mt-2 space-y-1.5 text-[13px] text-neutral-600">
                                  {item.highlights.map((bullet, bIdx) => (
                                    <li key={bIdx} className="flex items-start gap-2">
                                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                      <span>{bullet}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* ATS Keywords & Niche Positioning */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5">
                          <h5 className="text-[12.5px] font-semibold text-neutral-800">Recommended ATS Keywords</h5>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {result.atsKeywords?.map((kw) => (
                              <span key={kw} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5">
                          <h5 className="text-[12.5px] font-semibold text-neutral-800">Niche Positioning Strengths</h5>
                          <ul className="mt-2 space-y-1 text-[12px] text-neutral-600">
                            {result.nicheStrengths?.map((str, sIdx) => (
                              <li key={sIdx} className="flex items-center gap-1.5">
                                <Icon icon={CheckmarkCircle02Icon} size={14} className="text-brand shrink-0" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-neutral-200 bg-neutral-900 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-neutral-200">
                        {result.formattedMarkdown}
                      </pre>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-4">
              <div className="text-[12.5px] text-neutral-500">
                {appliedSuccess ? (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                    <Icon icon={Tick02Icon} size={15} />
                    Profile updated with arranged title, bio, and skills!
                  </span>
                ) : (
                  "Ready to arrange your CV and niche focus"
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Close
                </button>

                {result ? (
                  <button
                    type="button"
                    disabled={isApplying || appliedSuccess}
                    onClick={handleApplyToProfile}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-60"
                  >
                    {isApplying ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
                        Saving to Profile…
                      </>
                    ) : appliedSuccess ? (
                      <>
                        <Icon icon={Tick02Icon} size={15} />
                        Applied to Profile
                      </>
                    ) : (
                      <>
                        <Icon icon={CheckmarkCircle02Icon} size={15} />
                        Apply to My Profile
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
