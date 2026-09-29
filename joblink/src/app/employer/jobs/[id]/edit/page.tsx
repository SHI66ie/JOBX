import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { JobForm } from "@/components/employer/job-form";
import { Icon } from "@/components/ui/icon";
import { requireCompany } from "@/lib/employer";
import { updateJob } from "../../../actions";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, company } = await requireCompany();

  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).eq("company_id", company.id).maybeSingle();

  if (!job) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <Link href={`/employer/jobs/${job.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
        <Icon icon={ArrowLeft01Icon} size={16} />
        {job.title}
      </Link>
      <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.03em] text-neutral-900">Edit job</h1>
      <p className="mt-1 text-[14px] text-neutral-500">Changes show on the listing as soon as you save.</p>

      <div className="mt-4">
        <JobForm
          action={updateJob.bind(null, job.id)}
          mode="edit"
          defaults={{
            title: job.title,
            type: job.type || job.job_type,
            salary_range: job.salary_range,
            description: job.description,
            requirements: job.requirements,
            status: job.status,
          }}
        />
      </div>
    </div>
  );
}
