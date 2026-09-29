import Link from "next/link";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { JobForm } from "@/components/employer/job-form";
import { Icon } from "@/components/ui/icon";
import { requireCompany } from "@/lib/employer";
import { postJob } from "../../actions";

export default async function CreateJobPage() {
  const { company } = await requireCompany();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <Link href="/employer/jobs" className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
        <Icon icon={ArrowLeft01Icon} size={16} />
        Jobs
      </Link>
      <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.03em] text-neutral-900">Post a job</h1>
      <p className="mt-1 text-[14px] text-neutral-500">A remote role at {company.name}. Publish now or save it as a draft.</p>

      <div className="mt-4">
        <JobForm action={async (fd: FormData) => { await postJob(null, fd); }} mode="create" />
      </div>
    </div>
  );
}
