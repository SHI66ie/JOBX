import Link from "next/link";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { EmptyApplicationsArt } from "@/components/dashboard/empty-applications-art";
import { EmptyJobsArt } from "@/components/dashboard/empty-jobs-art";
import { EmptyState, PageHeader, Pill, PrimaryLink } from "@/components/employer/bits";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EMPLOYER_STATUS_LABELS, STATUS_TONES, applicationStatus } from "@/lib/applications";
import { candidateName, getCompanyApplications, getJobsForCompany, requireCompany } from "@/lib/employer";
import { jobStatusMeta, jobTypeLabel, postedAgo } from "@/lib/jobs";

export default async function EmployerOverview() {
  const { supabase, user, company } = await requireCompany();

  const [jobs, recent] = await Promise.all([getJobsForCompany(supabase, company.id), getCompanyApplications(supabase, company.id, 6)]);

  const allApps = jobs.flatMap((job) => job.applications ?? []);
  const openJobs = jobs.filter((job) => jobStatusMeta(job.status).value === "open").length;
  const toReview = allApps.filter((app) => app.status === "pending").length;
  const interviewing = allApps.filter((app) => app.status === "interviewing").length;
  const hired = allApps.filter((app) => app.status === "accepted").length;
  const firstName = String(user.user_metadata?.first_name || "");

  const stats = [
    { label: "Open jobs", value: openJobs, href: "/employer/jobs?status=open" },
    { label: "Applicants", value: allApps.length, href: "/employer/applicants" },
    { label: "New to review", value: toReview, href: "/employer/applicants?status=pending" },
    { label: "Interviewing", value: interviewing, href: "/employer/applicants?status=interviewing" },
    { label: "Hired", value: hired, href: "/employer/applicants?status=accepted" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <PageHeader
        eyebrow={company.name}
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Here's how your hiring is going."
        action={<PrimaryLink href="/employer/jobs/create">Post a job</PrimaryLink>}
      />

      {/* Stats: quiet numbers, no cards */}
      <dl className="mt-8 grid grid-cols-2 gap-y-6 border-y border-neutral-100 py-6 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group rounded-lg pr-4">
            <dt className="text-[13px] text-neutral-500 group-hover:text-neutral-700">{stat.label}</dt>
            <dd className="mt-1 text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-neutral-900">{stat.value}</dd>
          </Link>
        ))}
      </dl>

      {toReview > 0 ? (
        <Link
          href="/employer/applicants?status=pending"
          className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-brand/[0.06] px-4 py-3 text-[14px] text-neutral-800 transition-colors hover:bg-brand/[0.1]"
        >
          <span>
            <span className="font-semibold text-brand">{toReview}</span> new {toReview === 1 ? "applicant is" : "applicants are"} waiting for your review
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-brand">
            Review now <Icon icon={ArrowRight01Icon} size={15} />
          </span>
        </Link>
      ) : null}

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="jobs-heading" className="min-w-0">
          <div className="flex items-center justify-between">
            <h2 id="jobs-heading" className="text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">
              Your jobs
            </h2>
            {jobs.length ? (
              <Link href="/employer/jobs" className="text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
                View all
              </Link>
            ) : null}
          </div>

          {jobs.length ? (
            <ul className="mt-3 divide-y divide-neutral-100">
              {jobs.slice(0, 6).map((job) => {
                const status = jobStatusMeta(job.status);
                const apps = job.applications ?? [];
                const stages = [
                  { key: "pending", color: "bg-neutral-300", count: apps.filter((a) => a.status === "pending").length },
                  { key: "reviewed", color: "bg-sky-400", count: apps.filter((a) => a.status === "reviewed").length },
                  { key: "interviewing", color: "bg-violet-400", count: apps.filter((a) => a.status === "interviewing").length },
                  { key: "accepted", color: "bg-emerald-500", count: apps.filter((a) => a.status === "accepted").length },
                ];
                return (
                  <li key={job.id}>
                    <Link href={`/employer/jobs/${job.id}`} className="group grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center sm:gap-8">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[15px] font-semibold text-neutral-900 group-hover:text-brand">{job.title}</p>
                          <Pill className={status.className}>{status.label}</Pill>
                        </div>
                        <p className="mt-1 text-[13px] text-neutral-500">
                          {[jobTypeLabel(job.type), "Remote", `Posted ${postedAgo(job.created_at).toLowerCase()}`].filter(Boolean).join("  ·  ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[13px] text-neutral-700">
                          <span className="font-semibold tabular-nums text-neutral-900">{apps.length}</span> {apps.length === 1 ? "applicant" : "applicants"}
                        </p>
                        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-neutral-100" aria-hidden>
                          {apps.length
                            ? stages.map((stage) =>
                                stage.count ? <span key={stage.key} className={stage.color} style={{ width: `${(stage.count / apps.length) * 100}%` }} /> : null,
                              )
                            : null}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                art={<EmptyJobsArt variant="empty" />}
                title="No jobs posted yet"
                body="Post your first remote role and start meeting candidates."
                action={<PrimaryLink href="/employer/jobs/create">Post a job</PrimaryLink>}
              />
            </div>
          )}
        </section>

        <section aria-labelledby="latest-heading" className="min-w-0">
          <div className="flex items-center justify-between">
            <h2 id="latest-heading" className="text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">
              Latest applicants
            </h2>
            {recent.length ? (
              <Link href="/employer/applicants" className="text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
                Inbox
              </Link>
            ) : null}
          </div>

          {recent.length ? (
            <ul className="mt-3 divide-y divide-neutral-100">
              {recent.map((app) => {
                const status = applicationStatus(app.status);
                const name = candidateName(app.candidate);
                return (
                  <li key={app.id}>
                    <Link href={app.job ? `/employer/jobs/${app.job.id}#${app.id}` : "/employer/applicants"} className="group flex items-center gap-3 py-3.5">
                      <UserAvatar seed={app.candidate?.email || name} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-neutral-900 group-hover:text-brand">{name}</p>
                        <p className="truncate text-[12.5px] text-neutral-500">
                          {app.job?.title ?? "A job"} · {postedAgo(app.created_at).toLowerCase()}
                        </p>
                      </div>
                      <Pill className={STATUS_TONES[status.tone]}>{EMPLOYER_STATUS_LABELS[status.value]}</Pill>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-4 flex flex-col items-center rounded-2xl bg-neutral-50/70 px-6 py-10 text-center">
              <EmptyApplicationsArt />
              <p className="mt-5 text-[15px] font-semibold text-neutral-900">No applicants yet</p>
              <p className="mt-1 max-w-[260px] text-[13px] leading-5 text-neutral-500">New applications will show up here as they come in.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
