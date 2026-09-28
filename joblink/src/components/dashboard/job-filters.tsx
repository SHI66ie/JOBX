"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { JOB_TYPES } from "@/lib/jobs";
import { cn } from "@/lib/utils";

function useUpdateParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return { searchParams, update, isPending };
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-[18px] shrink-0 items-center justify-center rounded-[5px] transition-colors duration-150",
        checked ? "bg-brand" : "bg-surface ring-1 ring-inset ring-neutral-300 group-hover/opt:ring-neutral-400",
      )}
    >
      {checked ? (
        <svg viewBox="0 0 12 12" className="auth-pop size-3 text-brand-fg" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2.5 6.2 5 8.5l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  );
}

export function JobFilters({ counts }: { counts: Record<string, number> }) {
  const { searchParams, update, isPending } = useUpdateParams();
  const selected = searchParams.getAll("type");
  const hideApplied = searchParams.get("hide") === "applied";
  const hasFilters = selected.length > 0 || hideApplied;

  function toggleType(value: string) {
    update((params) => {
      const next = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
      params.delete("type");
      next.forEach((item) => params.append("type", item));
    });
  }

  const body = (
    <div className={cn("space-y-7 transition-opacity", isPending && "opacity-60")}>
      <fieldset>
        <legend className="flex w-full items-center justify-between text-[14px] font-medium text-neutral-900">
          Job type
          {hasFilters ? (
            <button
              type="button"
              onClick={() =>
                update((params) => {
                  params.delete("type");
                  params.delete("hide");
                })
              }
              className="text-[13px] font-normal text-brand hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </legend>
        <div className="mt-3 space-y-0.5">
          {JOB_TYPES.map((type) => {
            const checked = selected.includes(type.value);
            return (
              <label
                key={type.value}
                className="group/opt flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[14px] text-neutral-700 transition-colors hover:bg-neutral-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand"
              >
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleType(type.value)} />
                <Checkbox checked={checked} />
                <span className="flex-1">{type.label}</span>
                <span className="text-xs tabular-nums text-neutral-400">{counts[type.value] ?? 0}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[14px] font-medium text-neutral-900">Status</legend>
        <label className="group/opt mt-3 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[14px] text-neutral-700 transition-colors hover:bg-neutral-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand">
          <input
            type="checkbox"
            className="sr-only"
            checked={hideApplied}
            onChange={() => update((params) => (hideApplied ? params.delete("hide") : params.set("hide", "applied")))}
          />
          <Checkbox checked={hideApplied} />
          Hide jobs I&apos;ve applied to
        </label>
      </fieldset>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">{body}</aside>
      <details className="group rounded-2xl bg-surface p-4 ring-1 ring-neutral-200/70 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-medium text-neutral-900">
          <span className="flex items-center gap-2">
            <Icon icon={FilterHorizontalIcon} size={18} className="text-neutral-500" />
            Filters
            {hasFilters ? (
              <span className="rounded-full bg-brand px-1.5 text-[11px] leading-5 text-brand-fg">
                {selected.length + (hideApplied ? 1 : 0)}
              </span>
            ) : null}
          </span>
          <span className="text-xs text-neutral-400 group-open:hidden">Show</span>
          <span className="hidden text-xs text-neutral-400 group-open:inline">Hide</span>
        </summary>
        <div className="mt-4">{body}</div>
      </details>
    </>
  );
}

export function SortSelect({ value }: { value: string }) {
  const { update } = useUpdateParams();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Sort jobs</span>
      <select
        value={value}
        onChange={(event) =>
          update((params) => (event.target.value === "recent" ? params.delete("sort") : params.set("sort", event.target.value)))
        }
        className="h-10 cursor-pointer appearance-none rounded-full bg-surface pl-4 pr-9 text-[13px] font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200 transition-colors hover:ring-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <option value="recent">Most recent</option>
        <option value="oldest">Oldest first</option>
      </select>
      <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute right-3.5 size-3 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
