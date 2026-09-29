import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft01Icon, File01Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { EmptyApplicationsArt } from "@/components/dashboard/empty-applications-art";
import { EmptyState, LinkTabs, Pill } from "@/components/employer/bits";
import { JobMenu } from "@/components/employer/job-menu";
import { StageActions } from "@/components/employer/pipeline-actions";
import { Icon } from "@/components/ui/icon";
import { UserAvatar } from "@/components/ui/user-avatar";
import { EMPLOYER_STATUS_LABELS, STATUS_TONES, applicationStatus } from "@/lib/applications";
import { candidateName, formatDate, requireCompany, type CandidateSummary } from "@/lib/employer";
import { jobStatusMeta, jobTypeLabel, postedAgo } from "@/lib/jobs";

type ApplicationRow = {
  id: string;
  status: string;
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
  candidate: CandidateSummary | CandidateSummary[] | null;
};

export default async function JobDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab: tabParam }] = await Promise.all([params, searchParams]);
  const tab = tabParam === "details" ? "details" : "applicants";
  const { supabase, company } = await requireCompany();

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).eq("company_id", company.id).maybeSingle();

  if (!job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          art={<EmptyApplicationsArt />}
          title="Job not found"
          body="This listing doesn't exist or belongs to another company."
          action={
            <Link href="/employer/jobs" className="rounded-full bg-neutral-100 px-4 py-2 text-[13px] font-medium text-neutral-800 hover:bg-neutral-200/70">
              Back to jobs
            </Link>
          }
        />
      </div>
    );
  }

  const { data } = await supabase
    .from("applications")
    .select("id, status, cover_letter, resume_url, created_at, candidate:users (id, first_name, last_name, email, bio)")
    .eq("job_id", job.id)
    .order("created_at", { ascending: false });

  const apps = ((data ?? []) as ApplicationRow[]).map((app) => ({
    ...app,
    candidate: Array.isArray(app.candidate) ? (app.candidate[0] ?? null) : app.candidate,
  }));

  const meta = jobStatusMeta(job.status);
  const type = jobTypeLabel(job.type || job.job_type);
  const counts = { pending: 0, reviewed: 0, interviewing: 0, accepted: 0, rejected: 0 };
  for (const app of apps) counts[applicationStatus(app.status).value] += 1;
  const base = `/employer/jobs/${job.id}`;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <Link href="/employer/jobs" className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
        <Icon icon={ArrowLeft01Icon} size={16} />
        Jobs
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-neutral-900">{job.title}</h1>
            <Pill className={meta.className}>{meta.label}</Pill>
          </div>
          <p className="mt-1.5 text-[14px] text-neutral-500">
            {[type, "Remote", job.salary_range, `Posted ${postedAgo(job.created_at).toLowerCase()}`].filter(Boolean).join("  ·  ")}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`${base}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-100 px-4 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-200/70"
          >
            <Icon icon={PencilEdit02Icon} size={15} />
            Edit
          </Link>
          <JobMenu jobId={job.id} status={meta.value} />
        </div>
      </header>

      <div className="mt-8">
        <LinkTabs
          tabs={[
            { href: base, label: "Applicants", count: apps.length, active: tab === "applicants" },
            { href: `${base}?tab=details`, label: "Job details", active: tab === "details" },
          ]}
        />
      </div>

      {tab === "applicants" ? (
        <section aria-label="Applicants" className="mt-2">
          {apps.length ? (
            <>
              <p className="pt-4 text-[13px] text-neutral-500">
                {counts.pending} new · {counts.reviewed} in review · {counts.interviewing} interviewing · {counts.accepted} hired
              </p>
              <ul className="mt-1 divide-y divide-neutral-100">
                {apps.map((app) => {
                  const status = applicationStatus(app.status);
                  const name = candidateName(app.candidate);
                  return (
                    <li key={app.id} id={app.id} className="scroll-mt-24 py-5 target:-mx-3 target:rounded-xl target:bg-brand/[0.05] target:px-3">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <UserAvatar seed={app.candidate?.email || name} size={40} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[15px] font-semibold text-neutral-900">{name}</p>
                              <Pill className={STATUS_TONES[status.tone]}>{EMPLOYER_STATUS_LABELS[status.value]}</Pill>
                            </div>
                            <p className="mt-0.5 text-[13px] text-neutral-500">
                              {app.candidate?.email ? (
                                <a href={`mailto:${app.candidate.email}`} className="hover:text-neutral-900 hover:underline">
                                  {app.candidate.email}
                                </a>
                              ) : null}
                              {app.candidate?.email ? " · " : ""}
                              Applied {postedAgo(app.created_at).toLowerCase()}
                            </p>
                            {app.candidate?.bio ? <p className="mt-2 line-clamp-2 max-w-2xl text-[13.5px] leading-6 text-neutral-600">{app.candidate.bio}</p> : null}
                            {app.cover_letter ? (
                              <p className="mt-2 line-clamp-3 max-w-2xl whitespace-pre-line rounded-lg bg-neutral-50 px-3 py-2 text-[13px] leading-6 text-neutral-700">
                                {app.cover_letter}
                              </p>
                            ) : null}
                            {app.resume_url ? (
                              <a
                                href={app.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
                              >
                                <Icon icon={File01Icon} size={15} />
                                View CV
                              </a>
                            ) : null}
                          </div>
                        </div>
                        <div className="pl-[52px] sm:pl-0">
                          <StageActions applicationId={app.id} jobId={job.id} status={status.value} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                art={<EmptyApplicationsArt />}
                title="No applicants yet"
                body={meta.value === "open" ? "This job is live. Applications will appear here as they come in." : "Publish this job so candidates can find and apply to it."}
              />
            </div>
          )}
        </section>
      ) : (
        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 max-w-2xl">
            <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">About the role</h2>
            <div className="mt-3 whitespace-pre-line text-[15px] leading-7 text-neutral-700">{job.description}</div>

            <h2 className="mt-10 text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">Requirements</h2>
            {job.requirements ? (
              <div className="mt-3 whitespace-pre-line text-[15px] leading-7 text-neutral-700">{job.requirements}</div>
            ) : (
              <p className="mt-3 text-[14px] text-neutral-500">
                No requirements listed.{" "}
                <Link href={`${base}/edit`} className="font-medium text-brand hover:underline">
                  Add some
                </Link>{" "}
                to get better skill matches.
              </p>
            )}
          </article>

          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-[13px] font-medium text-neutral-500">At a glance</h2>
            <dl className="mt-3 divide-y divide-neutral-100">
              <Fact label="Status">
                <span className="flex flex-col items-end gap-0.5">
                  <Pill className={meta.className}>{meta.label}</Pill>
                  <span className="text-[12px] text-neutral-400">{meta.value === "open" ? "Visible to job seekers" : "Hidden from job seekers"}</span>
                </span>
              </Fact>
              <Fact label="Job type">{type ?? "—"}</Fact>
              <Fact label="Location">Remote</Fact>
              <Fact label="Pay">{job.salary_range || <span className="text-neutral-400">Not listed</span>}</Fact>
              <Fact label="Applicants">
                <Link href={base} className="font-medium text-brand hover:underline">
                  {apps.length} {apps.length === 1 ? "applicant" : "applicants"}
                </Link>
              </Fact>
              <Fact label="Posted">{formatDate(job.created_at)}</Fact>
              {job.updated_at ? <Fact label="Last updated">{formatDate(job.updated_at)}</Fact> : null}
            </dl>
          </aside>
        </div>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-[13px] text-neutral-500">{label}</dt>
      <dd className="text-right text-[14px] text-neutral-900">{children}</dd>
    </div>
  );
}
