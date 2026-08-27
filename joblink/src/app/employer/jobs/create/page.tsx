import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { postJob } from "../../actions";
import { requireCompany } from "@/lib/employer";

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
          <form action={postJob} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" name="title" placeholder="e.g. Senior Software Engineer" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Abuja, Lagos, or Remote" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Job type</Label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue="full-time"
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
                <Input id="salary_range" name="salary_range" placeholder="e.g. NGN 400,000 - 650,000 / month" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Visibility</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue="published"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="published">Publish now</option>
                  <option value="draft">Save as draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, team, and day-to-day work..."
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="Skills, experience, and qualifications..."
                rows={5}
              />
            </div>

            <Button type="submit">Post job</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
