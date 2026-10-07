import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ApplicationToolbar } from "@/components/dashboard/application-toolbar";
import { EmptyApplicationsArt } from "@/components/dashboard/empty-applications-art";
import { EmptyJobsArt } from "@/components/dashboard/empty-jobs-art";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { APPLICATION_STAGES, applicationStatus, type ApplicationStatus } from "@/lib/applications";
import { jobTypeLabel, jobTypeOf, postedAgo } from "@/lib/jobs";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "interviewing" | "closed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "interviewing", label: "Interviewing" },
  { value: "closed", label: "Closed" },
];

type Company = { name: string | null };
type Job = {
  id: string;
  title: string;
  type: string | null;
  job_type: string | null;
  salary_range: string | null;
  status: string | null;
  company: Company | null;
};
type Row = { id: string; status: string; created_at: string; job: Job | null };
type RawJob = Omit<Job, "company"> & { company: Company | Company[] | null };
type RawRow = Omit<Row, "job"> & { job: RawJob | RawJob[] | null };

/** Supabase can return a to-one relation as an object or a one-item array. */
function one<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

type SearchParams = { filter?: string; q?: string; type?: string; sort?: string };

export default async function MyApplicationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const params = await searchParams;
  const filter = (FILTERS.some((item) => item.value === params.filter) ? params.filter : "all") as Filter;
  const q = (params.q ?? "").trim().toLowerCase();
  const type = params.type ?? "";
  const oldestFirst = params.sort === "oldest";

  const { data } = await supabase
    .from("applications")
    .select("id, status, created_at, job:jobs (id, title, type, job_type, salary_range, status, company:companies (name))")
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: oldestFirst });

  const rows: Row[] = ((data ?? []) as unknown as RawRow[]).map((row) => {
    const job = one(row.job);
    return { ...row, job: job ? { ...job, company: one(job.company) } : null };
  });

  // Toolbar filters (search, type) apply first so the tab counts reflect them.
  const searched = rows.filter((row) => {
    if (type && jobTypeOf(row.job ?? { type: null, job_type: null }) !== type) return false;
    if (!q) return true;
    const haystack = `${row.job?.title ?? ""} ${row.job?.company?.name ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });

  const counts: Record<Filter, number> = { all: searched.length, active: 0, interviewing: 0, closed: 0 };
  for (const row of searched) counts[applicationStatus(row.status).group] += 1;

  const visible = filter === "all" ? searched : searched.filter((row) => applicationStatus(row.status).group === filter);
  const inProgress = rows.filter((row) => applicationStatus(row.status).group !== "closed").length;
  const interviewing = rows.filter((row) => applicationStatus(row.status).group === "interviewing").length;

  function tabHref(value: Filter) {
    const search = new URLSearchParams();
    if (value !== "all") search.set("filter", value);
    if (params.q) search.set("q", params.q);
    if (type) search.set("type", type);
    if (oldestFirst) search.set("sort", "oldest");
    const qs = search.toString();
    return qs ? `/dashboard/applications?${qs}` : "/dashboard/applications";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-neutral-900">My applications</h1>
          <p className="mt-1 text-[14px] text-neutral-500">
            {rows.length
              ? `${inProgress} in progress${interviewing ? ` · ${interviewing} interviewing` : ""} · ${rows.length} total`
              : "Track every job you apply to, from applied to hired."}
          </p>
        </div>
        {rows.length ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-brand px-4 py-2 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover"
          >
            Find more jobs
          </Link>
        ) : null}
      </header>

      {rows.length ? (
        <>
          <nav aria-label="Filter by status" className="mt-8 flex gap-6 overflow-x-auto border-b border-neutral-200">
            {FILTERS.map((item) => {
              const active = item.value === filter;
              return (
                <Link
                  key={item.value}
                  href={tabHref(item.value)}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-[14px] transition-colors",
                    active ? "border-brand font-medium text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900",
                  )}
                >
                  {item.label}
                  <span className={cn("text-[12px] tabular-nums", active ? "text-neutral-500" : "text-neutral-400")}>{counts[item.value]}</span>
                </Link>
              );
            })}
          </nav>

          <div>
            <ApplicationToolbar />
          </div>

          {visible.length ? (
            <ul key={`${filter}-${q}-${type}-${oldestFirst}`} className="mt-2 divide-y divide-neutral-100">
              {visible.map((row) => (
                <li key={row.id}>
                  <ApplicationRow row={row} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-2xl bg-neutral-50/70 px-6 pb-14 pt-12 text-center">
              <EmptyJobsArt variant="search" />
              <p className="mt-6 text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">No applications match</p>
              <p className="mt-1.5 max-w-sm text-[14px] leading-6 text-neutral-500">Try another search, job type or status.</p>
              <Link
                href="/dashboard/applications"
                className="mt-6 rounded-full bg-surface px-4 py-2 text-[13px] font-medium text-neutral-800 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
              >
                Clear filters
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 flex flex-col items-center px-6 pb-16 pt-14 text-center">
          <EmptyApplicationsArt />
          <p className="mt-7 text-[19px] font-semibold tracking-[-0.02em] text-neutral-900">Your applications will live here</p>
          <p className="mt-2 max-w-md text-[14px] leading-6 text-neutral-500">
            Apply to a job and follow it from the moment you hit send to the final decision, all in one place.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <Link href="/dashboard" className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover">
              Browse jobs
            </Link>
            <Link
              href="/dashboard/settings"
              className="rounded-full bg-neutral-100 px-5 py-2.5 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-200/70"
            >
              Polish your profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** Label colour and progress fill per status. The final stage reads as the outcome. */
const STATUS_STYLE: Record<ApplicationStatus, { text: string; fill: string }> = {
  pending: { text: "text-neutral-900", fill: "bg-brand" },
  reviewed: { text: "text-neutral-900", fill: "bg-brand" },
  interviewing: { text: "text-neutral-900", fill: "bg-brand" },
  accepted: { text: "text-emerald-700", fill: "bg-emerald-500" },
  rejected: { text: "text-neutral-500", fill: "bg-neutral-300" },
};

function ApplicationRow({ row }: { row: Row }) {
  const status = applicationStatus(row.status);
  const style = STATUS_STYLE[status.value];
  const job = row.job;
  const type = jobTypeLabel(job ? jobTypeOf(job) : null);
  const closedListing = Boolean(job?.status && job.status !== "published");
  const meta = [job?.company?.name || "Company", type, job?.salary_range, `Applied ${postedAgo(row.created_at).toLowerCase()}`].filter(Boolean);

  const body = (
    <>
      <div className="min-w-0">
        <h2 className="truncate text-[15.5px] font-semibold tracking-[-0.015em] text-neutral-900 transition-colors group-hover/app:text-brand">
          {job?.title || "Job no longer available"}
        </h2>
        <p className="mt-1 truncate text-[13px] text-neutral-500">
          {meta.join("  ·  ")}
          {closedListing ? <span className="text-neutral-400">{"  ·  "}Listing closed</span> : null}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full sm:w-36" aria-label={`Stage ${status.stage + 1} of ${APPLICATION_STAGES.length}: ${status.label}`}>
          <p className={cn("text-[13px] font-medium", style.text)}>{status.label}</p>
          <div className="mt-2 flex gap-1" aria-hidden>
            {APPLICATION_STAGES.map((stage, index) => (
              <span key={stage} className={cn("h-1 flex-1 rounded-full", index <= status.stage ? style.fill : "bg-neutral-200/80")} />
            ))}
          </div>
        </div>
        {job ? (
          <Icon
            icon={ArrowRight01Icon}
            size={16}
            className="hidden shrink-0 -translate-x-1 text-neutral-400 opacity-0 transition-[opacity,transform] duration-200 group-hover/app:translate-x-0 group-hover/app:opacity-100 sm:block"
          />
        ) : null}
      </div>
    </>
  );

  const className = "group/app -mx-3 grid gap-3 rounded-xl px-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-10";
  return job ? (
    <Link
      href={`/dashboard/jobs/${job.id}`}
      className={cn(className, "transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand")}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
