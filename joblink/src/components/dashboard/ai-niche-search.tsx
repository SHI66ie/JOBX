"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SparklesIcon, Search01Icon, Target02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { actionParseNicheSearch } from "@/app/actions/ai";

const NICHE_PRESETS = [
  { label: "🎯 My CV Match", query: "match-my-cv" },
  { label: "⚛️ React & Next.js", query: "React Next.js" },
  { label: "💻 Full-Stack Engineer", query: "Full-Stack Engineer" },
  { label: "🎨 Product Design", query: "Product Design Figma" },
  { label: "📈 Growth & Marketing", query: "Growth Marketing SEO" },
];

export function AINicheSearch({ candidateSkills = [] }: { candidateSkills?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [isSearching, startSearching] = useTransition();

  function executeSearch(query: string, types?: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    if (types && types.length > 0) {
      params.delete("type");
      types.forEach((t) => params.append("type", t));
    }

    // Best matches tab
    params.set("tab", "best");

    const qs = params.toString();
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    startSearching(async () => {
      const res = await actionParseNicheSearch(prompt);
      if (res.data?.searchKeywords) {
        executeSearch(res.data.searchKeywords, res.data.inferredJobTypes);
      } else {
        executeSearch(prompt);
      }
    });
  }

  function handlePresetClick(query: string) {
    if (query === "match-my-cv") {
      const topSkills = candidateSkills.slice(0, 3).join(" ");
      executeSearch(topSkills || "remote");
      return;
    }
    setPrompt(query);
    executeSearch(query);
  }

  return (
    <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/[0.04] via-brand/[0.02] to-transparent p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon icon={SparklesIcon} size={16} />
          </div>
          <span className="text-[13.5px] font-semibold text-neutral-900">
            AI Niche Job Matcher
          </span>
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
            Powered by Gemini
          </span>
        </div>
        <span className="text-[12px] text-neutral-500">
          Search in plain language or match to your CV skills
        </span>
      </div>

      <form onSubmit={handleSearchSubmit} className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
            <Icon icon={Search01Icon} size={17} />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'Senior remote React & TypeScript jobs' or 'High paying SaaS frontend'..."
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 shadow-2xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand px-4 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {isSearching ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" />
          ) : (
            <>
              <span>Find Niche</span>
              <Icon icon={ArrowRight01Icon} size={15} />
            </>
          )}
        </button>
      </form>

      {/* Preset pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] font-medium text-neutral-400 mr-1">Quick Niche:</span>
        {NICHE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePresetClick(preset.query)}
            className="rounded-full border border-neutral-200/80 bg-white px-2.5 py-1 text-[12px] font-medium text-neutral-700 transition-colors hover:border-brand/40 hover:bg-brand/[0.04] hover:text-brand"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
