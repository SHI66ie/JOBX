import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { postJob } from "../../actions";

export default async function CreateJobPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Ensure they have a company profile
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!company) {
    redirect("/employer/settings");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Employer Portal</span>
        </div>
        <p className="text-muted-foreground">Create a compelling job listing to attract qualified candidates.</p>
      </div>

      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide detailed information to help candidates understand the role and your company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={postJob} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Software Engineer"
                required
                className="border-blue-200"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Remote, US or New York, NY"
                  required
                  className="border-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Job Type *</Label>
                <select 
                  id="type" 
                  name="type"
                  className="flex h-9 w-full rounded-md border border-blue-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                name="salary_range"
                placeholder="$100,000 - $130,000"
                className="border-blue-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What will this person do? What are the requirements?"
                rows={8}
                required
                className="border-blue-200"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Publish Job</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
