"use client";

import { useState } from "react";
import {
  AiMail01Icon,
  Copy01Icon,
  CheckIcon,
  SparklesIcon,
  Cancel01Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionDraftCandidateNote } from "@/app/actions/ai";
import type { DraftedNoteResult } from "@/lib/ai";

export type AINoteDrafterProps = {
  jobTitle: string;
  companyName?: string;
  candidateName?: string;
  candidateTitle?: string;
};

export function AINoteDrafter({
  jobTitle,
  companyName,
  candidateName,
  candidateTitle,
}: AINoteDrafterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [noteType, setNoteType] = useState<"rejection" | "offer">("offer");
  const [tone, setTone] = useState<"warm" | "professional" | "brief">("warm");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DraftedNoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await actionDraftCandidateNote({
        noteType,
        jobTitle,
        companyName,
        candidateName,
        candidateTitle,
        tone,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setResult(res.data);
      }
    } catch {
      setError("Failed to draft note. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyAll() {
    if (!result) return;
    const fullText = `Subject: ${result.subject}\n\n${result.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          if (!result) handleGenerate();
        }}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-200/80 bg-surface px-3 text-[12.5px] font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100 hover:text-neutral-900"
      >
        <Icon icon={AiMail01Icon} size={14} className="text-brand" />
        <span>AI Draft Note</span>
      </button>

      {isOpen && (
        <div className="app-theme fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl border border-neutral-200/80 text-neutral-900 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-200/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon icon={AiMail01Icon} size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-neutral-900">
                    AI Note Drafter
                  </h3>
                  <p className="text-[12.5px] text-neutral-500">
                    Candidate: <span className="font-medium text-neutral-700">{candidateName || "Candidate"}</span> · {jobTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <Icon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            {/* Controls */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex rounded-lg bg-neutral-100 p-1 text-[12.5px] font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteType("offer");
                      setResult(null);
                    }}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
                      noteType === "offer"
                        ? "bg-surface text-emerald-700 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    <Icon icon={ThumbsUpIcon} size={13} />
                    Offer Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteType("rejection");
                      setResult(null);
                    }}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
                      noteType === "rejection"
                        ? "bg-surface text-amber-700 shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    <Icon icon={ThumbsDownIcon} size={13} />
                    Constructive Rejection
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[12px]">
                  <span className="text-neutral-400">Tone:</span>
                  {(["warm", "professional", "brief"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`rounded px-2 py-0.5 capitalize transition ${
                        tone === t
                          ? "bg-neutral-800 text-white font-medium"
                          : "text-neutral-500 hover:bg-neutral-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-3 min-h-[180px]">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-[13px] text-red-600">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex h-44 flex-col items-center justify-center gap-2 text-neutral-400">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
                  <span className="text-[13px]">Drafting thoughtful note...</span>
                </div>
              ) : result ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Subject
                    </label>
                    <div className="mt-1 rounded-lg border border-neutral-200/80 bg-neutral-100/50 p-2.5 text-[13px] font-medium text-neutral-900">
                      {result.subject}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      Body
                    </label>
                    <div className="mt-1 whitespace-pre-wrap rounded-lg border border-neutral-200/80 bg-neutral-100/50 p-3 text-[13px] leading-relaxed text-neutral-900 font-sans">
                      {result.body}
                    </div>
                  </div>

                  {result.tips && result.tips.length > 0 && (
                    <div className="rounded-lg bg-blue-50/50 p-2.5 border border-blue-100">
                      <span className="text-[11.5px] font-semibold text-blue-800">Recruiter Tip:</span>
                      <ul className="mt-1 list-disc pl-4 text-[12px] text-blue-700 space-y-0.5">
                        {result.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-36 flex-col items-center justify-center text-center text-neutral-400">
                  <p className="text-[13px]">Click &ldquo;Generate Note&rdquo; below to create the email draft.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:text-brand-hover disabled:opacity-50"
              >
                <Icon icon={SparklesIcon} size={14} />
                <span>{result ? "Regenerate" : "Generate Draft"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full px-3.5 py-1.5 text-[13px] text-neutral-600 hover:bg-neutral-100"
                >
                  Close
                </button>
                {result && (
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-[13px] font-medium text-brand-fg shadow-sm hover:bg-brand-hover transition"
                  >
                    <Icon icon={copied ? CheckIcon : Copy01Icon} size={14} />
                    <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
