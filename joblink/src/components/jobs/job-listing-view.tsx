import { RichDescription } from "@/components/jobs/rich-description";
import type { ReactNode } from "react";
import { companyMonogram, isNew, jobTypeLabel, postedAgo } from "@/lib/jobs";
import { cn } from "@/lib/utils";

export type ListingJob = {
  title: string;
  description: string | null;
  requirements: string | null;
  type: string | null;
  job_type?: string | null;
  salary_range: string | null;
  created_at: string;
};

export type ListingCompany = {
  name: string | null;
  description?: string | null;
  website?: string | null;
  team_size?: string | null;
} | null;

const TEAM_SIZE_LABELS: Record<string, string> = {
  solo: "Solo",
  small: "2–20 people",
  agency: "Agency",
  enterprise: "50+ people",
};

/**
 * A job listing as job seekers see it. Used on the candidate job page and as
 * the employer's preview; the caller supplies the action (Apply / Edit).
 */
export function JobListingView({
  job,
  company,
  action,
  matchedSkills = [],
}: {
  job: ListingJob;
  company: ListingCompany;
  action?: ReactNode;
  matchedSkills?: string[];
}) {
  const companyName = company?.name || "Company";
  const monogram = companyMonogram(companyName);
  const type = jobTypeLabel(job.type || job.job_type || null);
  const website = company?.website?.trim();

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="min-w-0">
        <header>
          <span className={cn("flex size-14 items-center justify-center rounded-2xl text-[18px] font-semibold", monogram.tone)}>{monogram.initials}</span>
          <h1 className="mt-5 text-balance text-[28px] font-semibold leading-tight tracking-[-0.03em] text-neutral-900 sm:text-[32px]">{job.title}</h1>
          <p className="mt-2 text-[15px] text-neutral-500">
            {companyName} · Posted {postedAgo(job.created_at).toLowerCase()}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {isNew(job.created_at) ? <Tag className="bg-violet-50 text-violet-700">New</Tag> : null}
            {type ? <Tag className="bg-emerald-50 text-emerald-700">{type}</Tag> : null}
            <Tag className="bg-orange-50 text-orange-700">Remote</Tag>
          </div>
          {action ? <div className="mt-6 lg:hidden">{action}</div> : null}
        </header>

        {matchedSkills.length ? (
          <div className="mt-8 rounded-xl bg-brand/[0.05] px-4 py-3">
            <p className="text-[13px] font-medium text-neutral-800">
              {matchedSkills.length} of your skills match this job
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {matchedSkills.map((skill) => (
                <span key={skill} className="rounded-full bg-surface px-2.5 py-1 text-[12.5px] font-medium text-neutral-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <section className="mt-10">
          <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">About the role</h2>
          <RichDescription value={job.description} />
        </section>

        {job.requirements ? (
          <section className="mt-10">
            <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">Requirements</h2>
            <div className="mt-3 whitespace-pre-line text-[15px] leading-7 text-neutral-700">{job.requirements}</div>
          </section>
        ) : null}

        {company?.description ? (
          <section className="mt-10">
            <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">About {companyName}</h2>
            <div className="mt-3 whitespace-pre-line text-[15px] leading-7 text-neutral-700">{company.description}</div>
          </section>
        ) : null}
      </article>

      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        {action ? <div className="hidden lg:block">{action}</div> : null}
        <dl className={cn("divide-y divide-neutral-100", action && "lg:mt-6")}>
          <Fact label="Pay">{job.salary_range || <span className="text-neutral-400">Not listed</span>}</Fact>
          <Fact label="Job type">{type ?? "—"}</Fact>
          <Fact label="Location">Remote</Fact>
          <Fact label="Posted">{postedAgo(job.created_at)}</Fact>
        </dl>

        <div className="mt-8">
          <p className="text-[13px] font-medium text-neutral-500">Company</p>
          <div className="mt-3 flex items-center gap-3">
            <span className={cn("flex size-10 items-center justify-center rounded-xl text-[13px] font-semibold", monogram.tone)}>{monogram.initials}</span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-neutral-900">{companyName}</p>
              <p className="truncate text-[13px] text-neutral-500">
                {[company?.team_size ? TEAM_SIZE_LABELS[company.team_size] ?? company.team_size : null, "Hiring remotely"].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          {website ? (
            <a
              href={website.startsWith("http") ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[13px] font-medium text-brand hover:underline"
            >
              {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function Tag({ className, children }: { className: string; children: ReactNode }) {
  return <span className={cn("inline-flex h-6 items-center rounded-md px-2 text-[12px] font-medium", className)}>{children}</span>;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-[13px] text-neutral-500">{label}</dt>
      <dd className="text-right text-[14px] text-neutral-900">{children}</dd>
    </div>
  );
}
