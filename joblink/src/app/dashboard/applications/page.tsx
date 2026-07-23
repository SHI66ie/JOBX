import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function MyApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch applications for this user
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      created_at,
      job:jobs (
        id,
        title,
        location,
        type,
        company:companies (name)
      )
    `)
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'interviewing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your job applications.</p>
        </div>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Browse More Jobs
        </Link>
      </div>

      {applications && applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((app: any) => (
            <Card key={app.id}>
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="font-semibold text-lg">{app.job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {app.job.company?.name || "Company"}
                    </div>
                    {app.job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {app.job.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="capitalize">{app.job.type.replace("-", " ")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Applied on {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <CardHeader>
            <CardTitle>No applications yet</CardTitle>
            <CardDescription>You haven't applied to any jobs yet. Head over to the job board to find your next opportunity!</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
              Browse Jobs
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
