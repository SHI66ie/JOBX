import { Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

/** Keyword search. A plain GET form so results live in the URL. */
export function JobSearch({ q, hidden }: { q: string; hidden: Record<string, string | string[]> }) {
  return (
    <form action="/dashboard" method="get" role="search" className="relative">
      {Object.entries(hidden).flatMap(([key, value]) =>
        (Array.isArray(value) ? value : [value]).map((item) => <input key={`${key}-${item}`} type="hidden" name={key} value={item} />),
      )}
      <label className="flex h-12 items-center gap-3 rounded-xl bg-neutral-100 pl-4 pr-1.5 transition-colors hover:bg-neutral-200/60 focus-within:bg-neutral-200/60">
        <Icon icon={Search01Icon} size={19} className="shrink-0 text-neutral-400" />
        <span className="sr-only">Search for jobs</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search for jobs, skills or companies"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
        <button
          type="submit"
          className="h-9 shrink-0 rounded-lg bg-brand px-4 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Search
        </button>
      </label>
    </form>
  );
}
