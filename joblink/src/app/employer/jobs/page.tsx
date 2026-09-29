import Link from "next/link";
import { EmptyJobsArt } from "@/components/dashboard/empty-jobs-art";
import { EmptyState, LinkTabs, PageHeader, Pill, PrimaryLink } from "@/components/employer/bits";
import { JobMenu } from "@/components/employer/job-menu";
import { getJobsForCompany, requireCompany } from "@/lib/employer";
import { jobStatusMeta, jobTypeLabel, postedAgo } from "@/lib/jobs";

type Filter = "all" | "open" | "draft" | "closed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "draft", label: "Drafts" },
  { value: "closed", label: "Closed" },
];

export default async function EmployerJobsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase, company } = await requireCompany();
  const { status } = await searchParams;
  const filter = (FILTERS.some((item) => item.value === status) ? status : "all") as Filter;

  const jobs = await getJobsForCompany(supabase, company.id);
  const counts: Record<Filter, number> = { all: jobs.length, open: 0, draft: 0, closed: 0 };
  for (const job of jobs) counts[jobStatusMeta(job.status).value] += 1;
  const visible = filter === "all" ? jobs : jobs.filter((job) => jobStatusMeta(job.status).value === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <PageHeader
        title="Jobs"
        description={jobs.length ? `${counts.open} open · ${jobs.length} total at ${company.name}` : `Roles you post for ${company.name} live here.`}
        action={<PrimaryLink href="/employer/jobs/create">Post a job</PrimaryLink>}
      />

      {jobs.length ? (
        <>
          <div className="mt-8">
            <LinkTabs
              tabs={FILTERS.map((item) => ({
                href: item.value === "all" ? "/employer/jobs" : `/employer/jobs?status=${item.value}`,
                label: item.label,
                count: counts[item.value],
                active: item.value === filter,
              }))}
            />
          </div>

          {visible.length ? (
            <ul className="divide-y divide-neutral-100">
              {visible.map((job) => {
                const meta = jobStatusMeta(job.status);
                const apps = job.applications ?? [];
                const fresh = apps.filter((app) => app.status === "pending").length;
                return (
                  <li key={job.id}>
                    <div className="group relative grid gap-3 py-5 pr-12 transition-colors sm:px-3 sm:pr-14 sm:hover:bg-neutral-50/70 md:grid-cols-[minmax(0,1fr)_140px_110px] md:items-center md:gap-8">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/employer/jobs/${job.id}`}
                            className="truncate text-[16px] font-semibold tracking-[-0.01em] text-neutral-900 after:absolute after:inset-0 group-hover:text-brand"
                          >
                            {job.title}
                          </Link>
                          <Pill className={meta.className}>{meta.label}</Pill>
                        </div>
                        <p className="mt-1 truncate text-[13px] text-neutral-500">
                          {[jobTypeLabel(job.type), "Remote", job.salary_range || null].filter(Boolean).join("  ·  ")}
                        </p>
                      </div>
                      <p className="text-[13px] text-neutral-600">
                        <span className="font-semibold tabular-nums text-neutral-900">{apps.length}</span> {apps.length === 1 ? "applicant" : "applicants"}
                        {fresh ? <span className="ml-1.5 text-brand">· {fresh} new</span> : null}
                      </p>
                      <p className="text-[13px] text-neutral-500">{postedAgo(job.created_at)}</p>
                      <JobMenu jobId={job.id} status={meta.value} className="absolute right-0 top-4 z-10 sm:right-2 md:top-1/2 md:-translate-y-1/2" />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState
                art={<EmptyJobsArt variant="search" />}
                title={`No ${FILTERS.find((item) => item.value === filter)?.label.toLowerCase()} jobs`}
                body="Jobs move between tabs as you publish, close or reopen them."
                action={
                  <Link href="/employer/jobs" className="rounded-full bg-surface px-4 py-2 text-[13px] font-medium text-neutral-800 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50">
                    See all jobs
                  </Link>
                }
              />
            </div>
          )}
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            art={<EmptyJobsArt variant="empty" />}
            title="No jobs yet"
            body="Post your first remote role. You can save it as a draft and publish when you're ready."
            action={<PrimaryLink href="/employer/jobs/create">Post a job</PrimaryLink>}
          />
        </div>
      )}
    </div>
  );
}
