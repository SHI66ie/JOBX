"use client";

import { useState, useTransition } from "react";
import { SparklesIcon, Cancel01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionTailorPitch } from "@/app/actions/ai";
import type { TailoredPitchResult } from "@/lib/ai";

export function AIApplicationPitch({
  jobTitle,
  companyName,
  jobDescription,
  candidateName,
  candidateTitle,
  candidateBio,
  candidateSkills,
}: {
  jobTitle: string;
  companyName?: string;
  jobDescription?: string;
  candidateName?: string;
  candidateTitle?: string;
  candidateBio?: string;
  candidateSkills?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [pitch, setPitch] = useState<TailoredPitchResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isGenerating, startGenerating] = useTransition();

  function handleGenerate() {
    setError("");
    setOpen(true);
    startGenerating(async () => {
      const res = await actionTailorPitch({
        jobTitle,
        companyName,
        jobDescription,
        candidateName,
        candidateTitle,
        candidateBio,
        candidateSkills,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to generate tailored application note.");
        return;
      }

      setPitch(res.data);
    });
  }

  function copyToClipboard() {
    if (!pitch) return;
    navigator.clipboard.writeText(pitch.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleGenerate}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand/25 bg-brand/[0.05] px-3.5 text-[12.5px] font-medium text-brand transition-colors hover:bg-brand/[0.12]"
      >
        <Icon icon={SparklesIcon} size={15} />
        Generate AI Pitch
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon icon={SparklesIcon} size={18} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-neutral-900">AI Tailored Pitch</h3>
                  <p className="text-[12.5px] text-neutral-500">Customized note highlighting why you fit {companyName ? `at ${companyName}` : "this role"}.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <Icon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                <p className="mt-3 text-[14px] font-medium text-neutral-800">Drafting your tailored application note…</p>
                <p className="text-[12.5px] text-neutral-500">Matching your background to the job requirements.</p>
              </div>
            ) : error ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="mt-3 rounded-full bg-neutral-100 px-4 py-1.5 text-[12.5px] font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  Try Again
                </button>
              </div>
            ) : pitch ? (
              <div className="mt-4 space-y-4 text-[13px]">
                {pitch.matchingPoints?.length ? (
                  <div>
                    <span className="font-semibold text-neutral-900">Why You Stand Out:</span>
                    <ul className="mt-1 space-y-1 text-neutral-700">
                      {pitch.matchingPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-brand font-bold">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div>
                  <span className="font-semibold text-neutral-900">Tailored Note:</span>
                  <div className="relative mt-1.5">
                    <p className="whitespace-pre-line rounded-xl bg-neutral-50 p-3.5 text-[13.5px] leading-6 text-neutral-800 ring-1 ring-neutral-200/60">
                      {pitch.coverLetter}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[12px] text-neutral-400">Ready to paste into your application</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-neutral-600 hover:bg-neutral-100"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-medium text-brand-fg hover:bg-brand-hover"
                    >
                      <Icon icon={copied ? Tick02Icon : Copy01Icon} size={15} />
                      {copied ? "Copied to Clipboard!" : "Copy Note"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
