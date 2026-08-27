import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Plus, Users, Clock3, CheckCircle2 } from "lucide-react";
import { formatDate, requireCompany, statusBadgeClass } from "@/lib/employer";

export default async function EmployerDashboard() {
  const { supabase, company } = await requireCompany();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, location, type, status, created_at, applications(id, status, created_at)")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const jobList = jobs || [];
  const allApps = jobList.flatMap((job) =>
    (job.applications || []).map((app) => ({ ...app, jobTitle: job.title, jobId: job.id }))
  );

  const openJobs = jobList.filter((job) => job.status === "published" || job.status === "active").length;
  const pending = allApps.filter((app) => app.status === "pending" || app.status === "reviewed").length;
  const hired = allApps.filter((app) => app.status === "accepted").length;

  const recentApps = [...allApps]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const stats = [
    { label: "Open jobs", value: openJobs, icon: Briefcase },
    { label: "Total applicants", value: allApps.length, icon: Users },
    { label: "Needs review", value: pending, icon: Clock3 },
    { label: "Hired", value: hired, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#01224F] dark:text-white/80">{company.name}</p>
          <h1 className="text-3xl font-bold tracking-tight">Hiring dashboard</h1>
          <p className="text-muted-foreground">Post roles, review candidates, and keep your pipeline moving.</p>
        </div>
        <Link href="/employer/jobs/create" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Post a job
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your jobs</h2>
            <Link href="/employer/jobs" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {jobList.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {jobList.slice(0, 6).map((job) => (
                <Card key={job.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg leading-snug">{job.title}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadgeClass(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <CardDescription>
                      {job.location} • {job.type || "—"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Applicants: <strong>{job.applications?.length || 0}</strong>
                    </span>
                    <Link href={`/employer/jobs/${job.id}`} className="text-primary hover:underline">
                      Manage
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed rounded-lg bg-card/50">
              <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-6">Create your first listing to start attracting candidates.</p>
              <Link href="/employer/jobs/create" className={buttonVariants({ variant: "default" })}>
                <Plus className="mr-2 h-4 w-4" /> Post a job
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Latest applicants</h2>
            <Link href="/employer/applicants" className="text-sm text-primary hover:underline">
              Inbox
            </Link>
          </div>
          {recentApps.length > 0 ? (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium truncate">{app.jobTitle}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(app.created_at)}</span>
                    </div>
                    <Link
                      href={`/employer/jobs/${app.jobId}`}
                      className="mt-3 inline-block text-xs text-primary hover:underline"
                    >
                      Review application
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-10 text-center">
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
