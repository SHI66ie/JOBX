import Link from "next/link";
import { EmptyApplicationsArt } from "@/components/dashboard/empty-applications-art";
import { EmptyJobsArt } from "@/components/dashboard/empty-jobs-art";
import { EmptyState, LinkTabs, PageHeader, Pill, PrimaryLink } from "@/components/employer/bits";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EMPLOYER_STATUS_LABELS, STATUS_TONES, applicationStatus, type ApplicationStatus } from "@/lib/applications";
import { candidateName, getCompanyApplications, requireCompany } from "@/lib/employer";
import { postedAgo } from "@/lib/jobs";

type Filter = "all" | ApplicationStatus;
const FILTERS: Filter[] = ["all", "pending", "reviewed", "interviewing", "accepted", "rejected"];

export default async function EmployerApplicantsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { supabase, company } = await requireCompany();
  const { status } = await searchParams;
  const filter = (FILTERS.includes(status as Filter) ? status : "all") as Filter;

  const applications = await getCompanyApplications(supabase, company.id);
  const counts = Object.fromEntries(FILTERS.map((item) => [item, 0])) as Record<Filter, number>;
  counts.all = applications.length;
  for (const app of applications) counts[applicationStatus(app.status).value] += 1;
  const visible = filter === "all" ? applications : applications.filter((app) => applicationStatus(app.status).value === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <PageHeader
        title="Applicants"
        description={
          applications.length
            ? `${counts.pending} new · ${counts.interviewing} interviewing · ${applications.length} total`
            : `Everyone who applies to ${company.name} shows up here.`
        }
      />

      {applications.length ? (
        <>
          <div className="mt-8">
            <LinkTabs
              tabs={FILTERS.map((item) => ({
                href: item === "all" ? "/employer/applicants" : `/employer/applicants?status=${item}`,
                label: item === "all" ? "All" : EMPLOYER_STATUS_LABELS[item],
                count: counts[item],
                active: item === filter,
              }))}
            />
          </div>

          {visible.length ? (
            <ul className="divide-y divide-neutral-100">
              {visible.map((app) => {
                const meta = applicationStatus(app.status);
                const name = candidateName(app.candidate);
                return (
                  <li key={app.id}>
                    <Link
                      href={app.job ? `/employer/jobs/${app.job.id}#${app.id}` : "/employer/applicants"}
                      className="group grid gap-3 py-4 transition-colors sm:px-3 sm:hover:bg-neutral-50/70 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_120px_100px] md:items-center md:gap-8"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <UserAvatar seed={app.candidate?.email || name} size={40} />
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium text-neutral-900 group-hover:text-brand">{name}</p>
                          <p className="truncate text-[13px] text-neutral-500">{app.candidate?.email}</p>
                        </div>
                      </div>
                      <p className="truncate pl-[52px] text-[13px] text-neutral-600 md:pl-0">{app.job?.title ?? "—"}</p>
                      <div className="pl-[52px] md:pl-0">
                        <Pill className={STATUS_TONES[meta.tone]}>{EMPLOYER_STATUS_LABELS[meta.value]}</Pill>
                      </div>
                      <p className="hidden text-[13px] text-neutral-500 md:block">{postedAgo(app.created_at)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState
                art={<EmptyJobsArt variant="search" />}
                title={`No ${filter === "all" ? "" : EMPLOYER_STATUS_LABELS[filter].toLowerCase()} applicants`}
                body="Applicants move between these tabs as you review them."
                action={
                  <Link href="/employer/applicants" className="rounded-full bg-surface px-4 py-2 text-[13px] font-medium text-neutral-800 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50">
                    See everyone
                  </Link>
                }
              />
            </div>
          )}
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            art={<EmptyApplicationsArt />}
            title="No applicants yet"
            body="Once your jobs are live, every application lands here so you can review, interview and hire."
            action={<PrimaryLink href="/employer/jobs/create">Post a job</PrimaryLink>}
          />
        </div>
      )}
    </div>
  );
}
