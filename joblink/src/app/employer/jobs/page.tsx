import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatDate, requireCompany, statusBadgeClass } from "@/lib/employer";

export default async function EmployerJobsPage() {
  const { supabase, company } = await requireCompany();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, location, type, status, salary_range, created_at, applications(id)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job listings</h1>
          <p className="text-muted-foreground">Create, edit, and close roles for {company.name}.</p>
        </div>
        <Link href="/employer/jobs/create" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Post a job
        </Link>
      </div>

      {jobs && jobs.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Applicants</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Posted</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{job.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{job.location}</td>
                      <td className="px-4 py-3 capitalize">{job.type || "—"}</td>
                      <td className="px-4 py-3">{job.applications?.length || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadgeClass(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(job.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/employer/jobs/${job.id}`} className="text-primary hover:underline">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="py-16 text-center border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-6">Your first job post will show up here.</p>
          <Link href="/employer/jobs/create" className={buttonVariants({ variant: "default" })}>
            Post a job
          </Link>
        </div>
      )}
    </div>
  );
}
