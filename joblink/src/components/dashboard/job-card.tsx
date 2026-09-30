"use client";

import { richTextExcerpt } from "@/lib/rich-text";
import Link from "next/link";
import { useState } from "react";
import { Building03Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { ApplySheet, type Applicant } from "@/components/dashboard/apply-sheet";
import { applyJob, isNew, jobTypeLabel, jobTypeOf, postedAgo, type ApplyJob, type JobListing } from "@/lib/jobs";
import { cn } from "@/lib/utils";

/** One job in the feed: Upwork-style full-width row. */
export function JobRow({
  job,
  applicant,
  hasApplied,
  matchedSkills,
}: {
  job: JobListing;
  applicant: Applicant;
  hasApplied: boolean;
  matchedSkills: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const type = jobTypeLabel(jobTypeOf(job));
  const description = richTextExcerpt(job.description ?? "");
  const isLong = description.length > 280;

  return (
    <article className="group relative px-1 py-6 transition-colors sm:px-5 sm:hover:bg-neutral-50/80">
      <p className="flex items-center gap-2 text-[12.5px] text-neutral-500">
        Posted {postedAgo(job.created_at).toLowerCase()}
        {isNew(job.created_at) ? (
          <span className="rounded-full bg-brand/[0.07] px-2 py-0.5 text-[11px] font-medium text-brand">New</span>
        ) : null}
      </p>

      <div className="mt-1.5 flex items-start justify-between gap-4">
        <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.015em] text-neutral-900">
          <Link href={`/dashboard/jobs/${job.id}`} className="hover:text-brand hover:underline hover:decoration-brand/30 hover:underline-offset-4">
            {job.title}
          </Link>
        </h3>
        <ApplyButton job={applyJob(job)} applicant={applicant} hasApplied={hasApplied} />
      </div>

      <p className="mt-1.5 text-[13px] text-neutral-500">
        {[type, "Remote", job.salary_range || "Pay not listed"].filter(Boolean).join("  ·  ")}
      </p>

      {description ? (
        <p className={cn("mt-3 whitespace-pre-line text-[14px] leading-6 text-neutral-700", !expanded && "line-clamp-3")}>
          {description}
        </p>
      ) : null}
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 text-[13px] font-medium text-brand hover:underline"
        >
          {expanded ? "Show less" : "More"}
        </button>
      ) : null}

      {matchedSkills.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {matchedSkills.map((skill) => (
            <span key={skill} className="rounded-full bg-neutral-100 px-2.5 py-1 text-[12.5px] font-medium text-neutral-700">
              {skill}
            </span>
          ))}
          <span className="ml-1 text-[12px] text-neutral-400">
            matches your skills
          </span>
        </div>
      ) : null}

      <p className="mt-4 flex items-center gap-1.5 text-[13px] text-neutral-500">
        <Icon icon={Building03Icon} size={15} className="text-neutral-400" />
        {job.company?.name || "Company"}
      </p>
    </article>
  );
}

export function ApplyButton({ job, applicant, hasApplied }: { job: ApplyJob; applicant: Applicant; hasApplied: boolean }) {
  const [applied, setApplied] = useState(hasApplied);
  const [open, setOpen] = useState(false);

  return (
    <>
      {applied ? (
        <span className="auth-pop inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 text-[13px] font-medium text-neutral-700">
          <Icon icon={Tick02Icon} size={15} strokeWidth={2.2} className="text-neutral-500" />
          Applied
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-brand px-4 text-[13px] font-medium text-brand-fg transition-[background-color,transform] hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:scale-95"
        >
          Apply now
        </button>
      )}
      <ApplySheet open={open} onClose={() => setOpen(false)} job={job} applicant={applicant} onApplied={() => setApplied(true)} />
    </>
  );
}
