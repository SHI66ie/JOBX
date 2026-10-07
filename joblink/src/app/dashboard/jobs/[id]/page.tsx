import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { ApplyButton } from "@/components/dashboard/job-card";
import { EmptyJobsArt } from "@/components/dashboard/empty-jobs-art";
import { JobListingView } from "@/components/jobs/job-listing-view";
import { AIApplicationPitch } from "@/components/ai/ai-application-pitch";
import { Icon } from "@/components/ui/icon";
import { applyJob, getJobListing, matchSkills } from "@/lib/jobs";
import { candidateProfileFromMeta } from "@/lib/profile";
import { signResume } from "@/lib/resumes";
import { JobPostingSchema } from "@/components/jobs/job-posting-schema";

// ---------------------------------------------------------------------------
// Per-job dynamic metadata — unique <title> + <meta description> for Google
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Use the anon client so metadata generation stays cookie-free (static-friendly)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";
  const anon = createAnonClient(supabaseUrl, supabaseKey);

  const job = await getJobListing(anon as Parameters<typeof getJobListing>[0], id, {
    publishedOnly: true,
  });

  if (!job) {
    return { title: "Job not found" };
  }

  const company = (job.company as { name?: string } | null)?.name;
  const title = company ? `${job.title} at ${company}` : job.title;
  const description = job.description
    ? job.description.replace(/\s+/g, " ").trim().slice(0, 155)
    : `Apply for ${title} on JOMP`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CandidateJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [job, { data: application }] = await Promise.all([
    getJobListing(supabase, id, { publishedOnly: true }),
    supabase.from("applications").select("id").eq("job_id", id).eq("candidate_id", user.id).maybeSingle(),
  ]);

  const back = (
    <Link href="/dashboard" className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
      <Icon icon={ArrowLeft01Icon} size={16} />
      Jobs
    </Link>
  );

  if (!job) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {back}
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-neutral-50/70 px-6 pb-14 pt-12 text-center">
          <EmptyJobsArt variant="search" />
          <p className="mt-6 text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">This job isn&apos;t available</p>
          <p className="mt-1.5 max-w-sm text-[14px] leading-6 text-neutral-500">It may have been filled or closed by the employer.</p>
          <Link href="/dashboard" className="mt-6 rounded-full bg-brand px-4 py-2 text-[13px] font-medium text-brand-fg hover:bg-brand-hover">
            Browse other jobs
          </Link>
        </div>
      </div>
    );
  }

  const profile = candidateProfileFromMeta(user.user_metadata);
  const resumeViewUrl = application ? null : await signResume(supabase, profile.resumeUrl);
  const matched = matchSkills(job, profile.skills);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <JobPostingSchema job={job} />
      {back}
      <div className="mt-6">
        <JobListingView
          job={job}
          company={job.company}
          matchedSkills={matched}
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <ApplyButton job={applyJob(job)} applicant={{ ...profile, email: user.email ?? "", resumeViewUrl }} hasApplied={Boolean(application)} />
              <AIApplicationPitch
                jobTitle={job.title}
                companyName={job.company?.name || undefined}
                jobDescription={job.description || undefined}
                candidateName={`${profile.firstName} ${profile.lastName}`.trim() || undefined}
                candidateTitle={profile.title}
                candidateBio={profile.bio}
                candidateSkills={profile.skills}
              />
              {application ? (
                <Link href="/dashboard/applications" className="text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
                  Track application
                </Link>
              ) : null}
            </div>
          }
        />
      </div>
    </div>
  );
}

