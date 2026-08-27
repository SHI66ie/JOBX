import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, requireCompany, statusBadgeClass } from "@/lib/employer";

type Candidate = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export default async function EmployerApplicantsPage() {
  const { supabase, company } = await requireCompany();

  const { data: jobs } = await supabase.from("jobs").select("id").eq("company_id", company.id);
  const jobIds = (jobs || []).map((job) => job.id);

  const { data: applications } =
    jobIds.length > 0
      ? await supabase
          .from("applications")
          .select(
            `
            id,
            status,
            created_at,
            job_id,
            job:jobs (id, title),
            candidate:users (first_name, last_name, email)
          `
          )
          .in("job_id", jobIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
        <p className="text-muted-foreground">Every candidate who applied to {company.name}.</p>
      </div>

      {applications && applications.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Applied</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const candidate = Array.isArray(app.candidate) ? app.candidate[0] : (app.candidate as Candidate | null);
                    const job = Array.isArray(app.job) ? app.job[0] : (app.job as { id?: string; title?: string } | null);
                    const name = [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ") || "Candidate";
                    return (
                      <tr key={app.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{name}</div>
                          <div className="text-muted-foreground">{candidate?.email}</div>
                        </td>
                        <td className="px-4 py-3">{job?.title || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadgeClass(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(app.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/employer/jobs/${app.job_id}`} className="text-primary hover:underline">
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="py-16 text-center border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No applicants yet</h3>
          <p className="text-muted-foreground">When candidates apply, they will appear in this inbox.</p>
        </div>
      )}
    </div>
  );
}
