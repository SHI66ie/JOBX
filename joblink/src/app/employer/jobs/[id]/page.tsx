import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteJob, setJobStatus, updateApplicationStatus } from "../../actions";
import { ArrowLeft } from "lucide-react";
import { formatDate, requireCompany, statusBadgeClass } from "@/lib/employer";

type Candidate = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
};

type ApplicationRow = {
  id: string;
  status: string;
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
  candidate: Candidate | Candidate[] | null;
};

function candidateOf(app: ApplicationRow): Candidate | null {
  if (!app.candidate) return null;
  return Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, company } = await requireCompany();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!job) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold">Job not found</h2>
        <p className="text-muted-foreground mt-2">
          This listing does not exist or you do not have permission to view it.
        </p>
        <Link href="/employer/dashboard" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      cover_letter,
      resume_url,
      created_at,
      candidate:users (
        id,
        first_name,
        last_name,
        email,
        bio
      )
    `
    )
    .eq("job_id", job.id)
    .order("created_at", { ascending: false });

  const apps = (applications || []) as ApplicationRow[];
  const isOpen = job.status === "published" || job.status === "active";
  const closeJob = setJobStatus.bind(null, job.id, "closed");
  const openJob = setJobStatus.bind(null, job.id, "published");
  const removeJob = deleteJob.bind(null, job.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/employer/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
            <span>{job.location}</span>
            <span>•</span>
            <span className="capitalize">{job.type || job.job_type || "—"}</span>
            <span>•</span>
            <span className={`capitalize px-2 py-0.5 rounded-full ${statusBadgeClass(job.status)}`}>{job.status}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/employer/jobs/${job.id}/edit`} className={buttonVariants({ variant: "outline" })}>
            Edit
          </Link>
          {isOpen ? (
            <form action={closeJob}>
              <Button type="submit" variant="outline">
                Close listing
              </Button>
            </form>
          ) : (
            <form action={openJob}>
              <Button type="submit" variant="outline">
                Reopen listing
              </Button>
            </form>
          )}
          <form action={removeJob}>
            <Button type="submit" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-muted-foreground">{job.description}</div>
              {job.requirements && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Requirements</p>
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground">{job.requirements}</div>
                </div>
              )}
              {job.salary_range && (
                <div className="mt-4 pt-4 border-t text-sm">
                  <strong>Salary range:</strong> {job.salary_range}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight">Applications ({apps.length})</h2>
          {apps.length > 0 ? (
            <div className="grid gap-4">
              {apps.map((app) => {
                const candidate = candidateOf(app);
                const name = [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ") || "Candidate";
                return (
                  <Card key={app.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{name}</CardTitle>
                      <CardDescription>
                        {candidate?.email || "No email"} • {formatDate(app.created_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {candidate?.bio && <p className="text-sm text-muted-foreground line-clamp-3">{candidate.bio}</p>}
                      {app.cover_letter && (
                        <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3">{app.cover_letter}</p>
                      )}
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View resume
                        </a>
                      )}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadgeClass(app.status)}`}>
                          {app.status}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {app.status !== "interviewing" && (
                            <form action={updateApplicationStatus.bind(null, app.id, "interviewing", job.id)}>
                              <Button size="sm" variant="outline" className="h-8">
                                Interview
                              </Button>
                            </form>
                          )}
                          {app.status !== "accepted" && (
                            <form action={updateApplicationStatus.bind(null, app.id, "accepted", job.id)}>
                              <Button size="sm" variant="outline" className="h-8 text-green-600 hover:text-green-700">
                                Accept
                              </Button>
                            </form>
                          )}
                          {app.status !== "rejected" && (
                            <form action={updateApplicationStatus.bind(null, app.id, "rejected", job.id)}>
                              <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700">
                                Reject
                              </Button>
                            </form>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
