import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateApplicationStatus } from "../../actions";
import { ArrowLeft } from "lucide-react";

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Ensure they have a company profile
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!company) {
    redirect("/employer/settings");
  }

  // Fetch job
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", params.id)
    .eq("company_id", company.id)
    .single();

  if (!job) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold">Job not found</h2>
        <p className="text-muted-foreground mt-2">The job you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/employer/dashboard" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Fetch applications for this job
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      created_at,
      candidate:users (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq("job_id", job.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/employer/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
        <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
          <span>{job.location}</span>
          <span>•</span>
          <span>{job.type}</span>
          <span>•</span>
          <span className="capitalize">{job.status}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                {job.description}
              </div>
              {job.salary_range && (
                <div className="mt-4 pt-4 border-t text-sm">
                  <strong>Salary Range:</strong> {job.salary_range}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">Applications ({applications?.length || 0})</h2>
          {applications && applications.length > 0 ? (
            <div className="grid gap-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {(app.candidate as any)?.first_name} {(app.candidate as any)?.last_name}
                    </CardTitle>
                    <CardDescription>{(app.candidate as any)?.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === "accepted" ? "bg-green-100 text-green-800" :
                        app.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      <div className="flex gap-2">
                        {app.status !== "accepted" && (
                          <form action={updateApplicationStatus.bind(null, app.id, "accepted", job.id)}>
                            <Button size="sm" variant="outline" className="h-8 text-green-600 hover:text-green-700">Accept</Button>
                          </form>
                        )}
                        {app.status !== "rejected" && (
                          <form action={updateApplicationStatus.bind(null, app.id, "rejected", job.id)}>
                            <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700">Reject</Button>
                          </form>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-8 text-center bg-muted/50">
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
