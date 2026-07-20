import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createCompanyProfile } from "../actions";
import Link from "next/link";

export default async function CompanyDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an employer
  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role !== "employer") {
    redirect("/dashboard/seeker");
  }

  // Check if the user has created a company
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("created_by", user.id)
    .single();

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Create Company Profile</CardTitle>
            <CardDescription>You need to create a company profile before you can post jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCompanyProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" placeholder="https://acme.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="What does your company do?" rows={4} />
              </div>
              <Button type="submit" className="w-full">Create Company</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch jobs for this company
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  // Fetch total applicants for these jobs
  const jobIds = jobs?.map(job => job.id) || [];
  const { count: totalApplicants } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .in("job_id", jobIds);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your job postings and applicants for {company.name}.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/company/post-job">Post a Job</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs?.filter(j => j.status === 'published').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplicants || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Your Job Postings</h2>
        {jobs && jobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Card key={job.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.location} • {job.type}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                </CardContent>
                <div className="p-6 pt-0 mt-auto flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full font-medium">
                    {job.status}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/company/jobs/${job.id}`}>View Applicants</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <CardHeader>
              <CardTitle>No jobs posted yet</CardTitle>
              <CardDescription>Create your first job posting to start finding candidates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/company/post-job">Post a Job</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
