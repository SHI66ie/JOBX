"use client";

import { useState, useTransition } from "react";
import { SparklesIcon, MagicWand01Icon, Cancel01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionGenerateJob } from "@/app/actions/ai";

type GeneratedData = {
  title: string;
  type: string;
  salary_range: string;
  description: string;
  requirements: string;
  skills: string[];
};

const PROMPT_PRESETS = [
  { label: "Senior Frontend Engineer", hint: "React, Next.js, TypeScript, async remote" },
  { label: "Full-Stack Developer", hint: "Node.js, Postgres, modern cloud, REST/GraphQL" },
  { label: "Product Designer", hint: "Figma, design systems, UX research, prototypes" },
  { label: "Growth / Marketing Lead", hint: "SEO, conversion funnels, analytics, content strategy" },
  { label: "Customer Success Specialist", hint: "Async support, CRM, problem solving, empathetic" },
];

export function AIJobAssistant({
  companyName,
  onApply,
}: {
  companyName?: string;
  onApply: (data: GeneratedData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [promptTitle, setPromptTitle] = useState("");
  const [promptNotes, setPromptNotes] = useState("");
  const selectedType = "full-time";
  const [result, setResult] = useState<GeneratedData | null>(null);
  const [error, setError] = useState("");
  const [isGenerating, startGenerating] = useTransition();

  function handleGenerate(customTitle?: string, customNotes?: string) {
    const title = customTitle ?? promptTitle;
    const notes = customNotes ?? promptNotes;
    setError("");

    startGenerating(async () => {
      const res = await actionGenerateJob({
        title,
        notes,
        type: selectedType,
        companyName,
      });

      if (res.error || !res.data) {
        setError(res.error || "Failed to generate job description.");
        return;
      }

      setResult(res.data);
    });
  }

  function handlePreset(preset: (typeof PROMPT_PRESETS)[0]) {
    setPromptTitle(preset.label);
    setPromptNotes(preset.hint);
    handleGenerate(preset.label, preset.hint);
  }

  function handleAccept() {
    if (!result) return;
    onApply(result);
    setOpen(false);
    setResult(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-brand transition-colors hover:bg-brand/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Icon icon={SparklesIcon} size={15} className="text-brand" />
        Draft with AI
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-neutral-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon icon={MagicWand01Icon} size={20} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-neutral-900">AI Job Description Drafter</h3>
                  <p className="text-[13px] text-neutral-500">Draft high-converting job descriptions and requirements in seconds.</p>
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

            {!result ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-neutral-800">Quick Presets</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PROMPT_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePreset(preset)}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-[12.5px] font-medium text-neutral-700 transition-colors hover:bg-brand/[0.08] hover:text-brand"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label htmlFor="ai-job-title" className="block text-[13px] font-medium text-neutral-800">
                      Target Job Title
                    </label>
                    <input
                      id="ai-job-title"
                      type="text"
                      value={promptTitle}
                      onChange={(e) => setPromptTitle(e.target.value)}
                      placeholder="e.g. Senior Backend Engineer"
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  <div>
                    <label htmlFor="ai-job-notes" className="block text-[13px] font-medium text-neutral-800">
                      Key requirements or notes (optional)
                    </label>
                    <textarea
                      id="ai-job-notes"
                      rows={3}
                      value={promptNotes}
                      onChange={(e) => setPromptNotes(e.target.value)}
                      placeholder="e.g. 4+ years experience, async remote team in European/Americas timezones, modern stack..."
                      className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>

                {error ? <p className="text-[13px] text-red-600">{error}</p> : null}

                <div className="flex items-center justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isGenerating || (!promptTitle.trim() && !promptNotes.trim())}
                    onClick={() => handleGenerate()}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-[13.5px] font-medium text-brand-fg transition-all hover:bg-brand-hover disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
                        Generating with AI…
                      </>
                    ) : (
                      <>
                        <Icon icon={SparklesIcon} size={16} />
                        Generate Posting
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-xl bg-neutral-50/70 p-4 text-[13.5px]">
                  <div>
                    <span className="font-semibold text-neutral-900">Job Title: </span>
                    <span className="text-neutral-800">{result.title}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900">Estimated Pay: </span>
                    <span className="text-neutral-800">{result.salary_range}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Description:</p>
                    <p className="mt-1 whitespace-pre-line text-neutral-700">{result.description}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Requirements:</p>
                    <p className="mt-1 whitespace-pre-line text-neutral-700">{result.requirements}</p>
                  </div>
                  {result.skills?.length ? (
                    <div>
                      <p className="font-semibold text-neutral-900">Suggested Skills:</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {result.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-neutral-200/80 px-2.5 py-0.5 text-[12px] font-medium text-neutral-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="text-[13px] font-medium text-neutral-500 hover:text-neutral-900"
                  >
                    ← Try another prompt
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-full px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={handleAccept}
                      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-5 text-[13.5px] font-medium text-brand-fg transition-colors hover:bg-brand-hover"
                    >
                      <Icon icon={CheckmarkCircle02Icon} size={16} />
                      Insert into Form
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
