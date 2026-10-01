"use client";

import { useState, useTransition } from "react";
import { SparklesIcon, Cancel01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionEnhanceBio } from "@/app/actions/ai";
import type { EnhancedBioResult } from "@/lib/ai";

export function AIBioEnhancer({
  currentBio,
  currentTitle,
  skills,
  onApply,
}: {
  currentBio: string;
  currentTitle?: string;
  skills: string[];
  onApply: (data: { bio: string; title?: string; skills?: string[] }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<EnhancedBioResult | null>(null);
  const [error, setError] = useState("");
  const [isEnhancing, startEnhancing] = useTransition();

  function handleEnhance() {
    setError("");
    setOpen(true);
    startEnhancing(async () => {
      const res = await actionEnhanceBio({
        currentBio,
        currentTitle,
        skills,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to enhance bio.");
        return;
      }

      setResult(res.data);
    });
  }

  function handleAccept() {
    if (!result) return;
    onApply({
      bio: result.enhancedBio,
      title: result.suggestedTitle,
      skills: Array.from(new Set([...skills, ...result.suggestedSkills])),
    });
    setOpen(false);
    setResult(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleEnhance}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/[0.06] px-3 py-1 text-[12.5px] font-medium text-brand transition-colors hover:bg-brand/[0.12]"
      >
        <Icon icon={SparklesIcon} size={14} />
        Polish with AI
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
                  <h3 className="text-[16px] font-semibold text-neutral-900">AI Profile Enhancer</h3>
                  <p className="text-[12.5px] text-neutral-500">Upgrade your bio and discover high-value skills for remote hiring.</p>
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

            {isEnhancing ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                <p className="mt-3 text-[14px] font-medium text-neutral-800">Polishing your profile with AI…</p>
                <p className="text-[12.5px] text-neutral-500">Refining wording, highlights, and matching skills.</p>
              </div>
            ) : error ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={handleEnhance}
                  className="mt-3 rounded-full bg-neutral-100 px-4 py-1.5 text-[12.5px] font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  Try Again
                </button>
              </div>
            ) : result ? (
              <div className="mt-4 space-y-4 text-[13px]">
                <div>
                  <span className="font-semibold text-neutral-900">Suggested Title:</span>
                  <p className="mt-1 rounded-lg bg-neutral-50 px-3 py-2 text-neutral-800 font-medium">{result.suggestedTitle}</p>
                </div>

                <div>
                  <span className="font-semibold text-neutral-900">Polished Bio:</span>
                  <p className="mt-1 whitespace-pre-line rounded-lg bg-neutral-50 px-3 py-2.5 leading-6 text-neutral-800">{result.enhancedBio}</p>
                </div>

                {result.suggestedSkills?.length ? (
                  <div>
                    <span className="font-semibold text-neutral-900">Suggested Skills to Add:</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {result.suggestedSkills.map((sk) => (
                        <span key={sk} className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[12px] font-medium text-brand">
                          +{sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100"
                  >
                    Keep Original
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-medium text-brand-fg hover:bg-brand-hover"
                  >
                    <Icon icon={CheckmarkCircle02Icon} size={15} />
                    Apply Changes
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
