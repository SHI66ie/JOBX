import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { updateApplicationStatus } from "../../../actions";

export default async function ViewApplicantsPage({ params }: { params: { jobId: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify the employer owns this job
  const { data: job } = await supabase
    .from("jobs")
    .select("*, company:companies(created_by)")
    .eq("id", params.jobId)
    .single();

  if (!job || job.company?.created_by !== user.id) {
    redirect("/dashboard/company");
  }

  // Fetch applicants for this job
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      candidate:users (
        first_name,
        last_name,
        role
      )
    `)
    .eq("job_id", params.jobId)
    .order("created_at", { ascending: false });

  const STATUSES = ['pending', 'reviewed', 'interviewing', 'rejected', 'hired'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applicants for {job.title}</h1>
          <p className="text-muted-foreground">Review and manage candidates who have applied for this position.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {applications && applications.length > 0 ? (
          applications.map((app: any) => (
            <Card key={app.id}>
              <CardHeader className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">
                    {app.candidate?.first_name} {app.candidate?.last_name}
                  </CardTitle>
                  <CardDescription>
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <form action={async (formData) => {
                    "use server";
                    const newStatus = formData.get("status") as string;
                    await updateApplicationStatus(app.id, newStatus, params.jobId);
                  }}>
                    <select 
                      name="status"
                      defaultValue={app.status}
                      onChange={(e) => {
                        e.target.form?.requestSubmit();
                      }}
                      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s} className="capitalize bg-white dark:bg-black text-black dark:text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </form>
                </div>
              </CardHeader>
              <CardContent>
                {/* For MVP, we don't have resumes yet, so we just show a placeholder */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-sm text-muted-foreground text-center border border-dashed">
                  Resume viewing will be available in a future update.
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <CardHeader>
              <CardTitle>No applicants yet</CardTitle>
              <CardDescription>When candidates apply to this job, they will appear here.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
