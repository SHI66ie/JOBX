import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { postJob } from "../../actions";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function PostJobPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role !== "employer") {
    redirect("/dashboard/seeker");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/company">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Provide clear and accurate details to attract the best candidates.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={postJob} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Senior Frontend Engineer" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="e.g. Remote, San Francisco, CA" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Employment Type</Label>
                <Select name="type" defaultValue="full-time">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range (Optional)</Label>
              <Input id="salary_range" name="salary_range" placeholder="e.g. $120k - $150k" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                required 
                placeholder="Describe the responsibilities, requirements, and benefits..." 
                className="min-h-[200px]" 
              />
            </div>

            <Button type="submit" className="w-full">Publish Job</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
