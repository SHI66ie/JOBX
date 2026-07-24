import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default async function EmployerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Check if they have a company profile
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("created_by", user.id)
    .single();

  if (!company) {
    redirect("/employer/settings"); // Redirect to settings if no company
  }

  // Fetch jobs for this company
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, location, type, status, created_at, applications(id)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Employer Portal</span>
          </div>
          <p className="text-muted-foreground">Manage your job postings and review candidate applications.</p>
        </div>
        <Link href="/employer/jobs/create" className={buttonVariants({ variant: "default", className: "bg-blue-600 hover:bg-blue-700" })}>
          <Plus className="mr-2 h-4 w-4" /> Post a New Job
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="flex flex-col hover:shadow-md transition-shadow border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    job.status === "published" ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                  }`}>
                    {job.status}
                  </span>
                </div>
                <CardDescription>{job.location} • {job.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="flex items-center justify-between mt-4 text-sm">
                  <span className="text-muted-foreground">
                    Candidates: <strong>{job.applications?.length || 0}</strong>
                  </span>
                  <Link href={`/employer/jobs/${job.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                    View Applications
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50">
            <h3 className="text-xl font-semibold mb-2 text-blue-900">No Jobs Posted Yet</h3>
            <p className="text-blue-700 mb-6">Create your first job posting to start attracting qualified candidates.</p>
            <Link href="/employer/jobs/create" className={buttonVariants({ variant: "default", className: "bg-blue-600 hover:bg-blue-700" })}>
              <Plus className="mr-2 h-4 w-4" /> Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
