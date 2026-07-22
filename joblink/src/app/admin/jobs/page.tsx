import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminJobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, location, type, status, company_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Review all job listings and their status across the platform.
          </p>
        </div>
        <Link href="/admin" className={buttonVariants({ variant: "default" })}>
          Back to Admin
        </Link>
      </div>

      <div className="grid gap-4">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>{job.location} • {job.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                  <span>Status: {job.status}</span>
                  <span>Company ID: {job.company_id}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <CardHeader>
              <CardTitle>No jobs found</CardTitle>
              <CardDescription>There are no job listings in the system yet.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
