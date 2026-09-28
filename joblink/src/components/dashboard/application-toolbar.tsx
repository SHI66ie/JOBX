"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { JOB_TYPES } from "@/lib/jobs";
import { cn } from "@/lib/utils";

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none rounded-xl pl-3.5 pr-9 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          value ? "bg-brand/[0.06] text-brand" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/60",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute right-3.5 top-1/2 size-3 -translate-y-1/2 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

/** Search + job type + sort, all kept in the URL. */
export function ApplicationToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const timer = useRef<number | undefined>(undefined);

  const type = searchParams.get("type") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const hasAny = Boolean(query || type || sort);

  function push(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function set(key: string, value: string) {
    push((params) => (value ? params.set(key, value) : params.delete(key)));
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className={cn("flex flex-col gap-2 py-4 sm:flex-row sm:items-center", isPending && "opacity-70")}>
      <label className="flex h-10 flex-1 items-center gap-2.5 rounded-xl bg-neutral-100 px-3.5 transition-colors hover:bg-neutral-200/60 focus-within:bg-neutral-200/60">
        <Icon icon={Search01Icon} size={17} className="shrink-0 text-neutral-400" />
        <span className="sr-only">Search applications</span>
        <input
          value={query}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => set("q", value.trim()), 300);
          }}
          placeholder="Search by job title or company"
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Select
          label="Job type"
          value={type}
          onChange={(value) => set("type", value)}
          options={[{ value: "", label: "All job types" }, ...JOB_TYPES.map((item) => ({ value: item.value, label: item.label }))]}
        />
        <Select
          label="Sort"
          value={sort}
          onChange={(value) => set("sort", value)}
          options={[
            { value: "", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
          ]}
        />
      </div>

      {hasAny ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            push((params) => {
              params.delete("q");
              params.delete("type");
              params.delete("sort");
            });
          }}
          className="self-start px-1 text-[13px] font-medium text-neutral-500 hover:text-neutral-900 sm:self-center"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
