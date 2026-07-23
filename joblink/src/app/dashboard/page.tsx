import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { JobCard } from "@/components/job-card";
import { applyForJob } from "./actions";

export default async function SeekerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch all published jobs with company details
  const { data: jobs } = await supabase
    .from("jobs")
    .select(`
      *,
      company:companies (name)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Fetch user's applications
  const { data: applications } = await supabase
    .from("applications")
    .select("job_id")
    .eq("candidate_id", user.id);

  const appliedJobIds = new Set(applications?.map(app => app.job_id) || []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
        <p className="text-muted-foreground">Discover and apply to the best opportunities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs?.map((job) => (
          <form key={job.id} action={applyForJob.bind(null, job.id)}>
            <JobCard 
              job={job} 
              hasApplied={appliedJobIds.has(job.id)} 
            />
          </form>
        ))}

        {(!jobs || jobs.length === 0) && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No active job postings right now. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
