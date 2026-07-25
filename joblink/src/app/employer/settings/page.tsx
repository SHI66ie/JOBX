import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { upsertCompanyProfile } from "../actions";
import { addRole, getUserRoles } from "@/app/login/actions";
import Link from "next/link";

export default async function EmployerSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Get existing company profile
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("created_by", user.id)
    .single();

  const roles = getUserRoles(user);
  const hasCandidate = roles.includes("candidate");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-muted-foreground">
          Manage your company profile information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            {company
              ? "Update your company information"
              : "Create your company profile to start posting jobs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={upsertCompanyProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={company?.name || ""}
                placeholder="Your Company Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={company?.description || ""}
                placeholder="Tell us about your company"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={company?.website || ""}
                placeholder="https://yourcompany.com"
              />
            </div>

            <Button type="submit">
              {company ? "Update Profile" : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dual-role: Add Applicant */}
      {!hasCandidate && (
        <Card className="border-dashed border-[#00bcd4]/40">
          <CardHeader>
            <CardTitle>Also looking for a job?</CardTitle>
            <CardDescription>
              Add the Applicant role to this account so you can browse and apply
              for jobs. You will keep your Employer profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addRole}>
              <input type="hidden" name="role" value="candidate" />
              <Button type="submit" variant="outline">
                Register as Applicant
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Dual-role: already has candidate → link to it */}
      {hasCandidate && (
        <Card>
          <CardHeader>
            <CardTitle>Applicant Dashboard</CardTitle>
            <CardDescription>
              You already have an Applicant role on this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Applicant Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
