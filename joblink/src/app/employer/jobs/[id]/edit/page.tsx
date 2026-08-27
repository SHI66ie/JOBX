import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { updateJob } from "../../../actions";
import { requireCompany } from "@/lib/employer";

export default async function EditJobPage({
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
    notFound();
  }

  const updateThisJob = updateJob.bind(null, job.id);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Link href={`/employer/jobs/${job.id}`} className="text-sm text-muted-foreground hover:text-primary">
          ← Back to job
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Edit job</h1>
        <p className="text-muted-foreground">Update the listing for {job.title}.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
          <CardDescription>Changes go live immediately after you save.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateThisJob} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" name="title" defaultValue={job.title} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={job.location || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Job type</Label>
                <select
                  id="type"
                  name="type"
                  defaultValue={job.type || job.job_type || "full-time"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary range</Label>
                <Input id="salary_range" name="salary_range" defaultValue={job.salary_range || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Visibility</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={job.status || "published"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job description</Label>
              <Textarea id="description" name="description" defaultValue={job.description || ""} rows={8} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" name="requirements" defaultValue={job.requirements || ""} rows={5} />
            </div>

            <div className="flex gap-3">
              <Button type="submit">Save changes</Button>
              <Link href={`/employer/jobs/${job.id}`} className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
