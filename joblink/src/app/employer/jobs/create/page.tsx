import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCompany } from "@/lib/employer";
import { JobForm } from "./job-form";

export default async function CreateJobPage() {
  await requireCompany();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post a new job</h1>
        <p className="text-muted-foreground">Publish a role and start collecting applications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
          <CardDescription>These fields appear on the public listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm />
        </CardContent>
      </Card>
    </div>
  );
}
