import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft01Icon, PencilEdit02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { JobListingView } from "@/components/jobs/job-listing-view";
import { Icon } from "@/components/ui/icon";
import { requireCompany } from "@/lib/employer";
import { getJobListing, jobStatusMeta } from "@/lib/jobs";

export default async function JobPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, company } = await requireCompany();
  const job = await getJobListing(supabase, id, { companyId: company.id });

  if (!job) {
    notFound();
  }

  const status = jobStatusMeta(job.status);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <Link href={`/employer/jobs/${job.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
        <Icon icon={ArrowLeft01Icon} size={16} />
        {job.title}
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand/[0.06] px-4 py-3">
        <p className="flex items-center gap-2 text-[13.5px] text-neutral-800">
          <Icon icon={ViewIcon} size={17} className="text-brand" />
          <span>
            <span className="font-medium">Preview.</span> This is how job seekers see your listing.
            {status.value !== "open" ? <span className="text-neutral-500"> It&apos;s {status.label.toLowerCase()}, so it isn&apos;t visible yet.</span> : null}
          </span>
        </p>
        <Link
          href={`/employer/jobs/${job.id}/edit`}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface px-3.5 text-[13px] font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
        >
          <Icon icon={PencilEdit02Icon} size={14} />
          Edit listing
        </Link>
      </div>

      <div className="mt-8">
        <JobListingView
          job={job}
          company={job.company}
          action={
            <span className="inline-flex h-9 cursor-not-allowed items-center rounded-full bg-brand px-4 text-[13px] font-medium text-brand-fg opacity-60" title="Job seekers apply here">
              Apply now
            </span>
          }
        />
      </div>
    </div>
  );
}
