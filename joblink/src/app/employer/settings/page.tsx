import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { addRole } from "@/app/login/actions";
import { getUserRoles } from "@/utils/auth";
import { requireEmployerUser } from "@/lib/employer";
import { EmployerSettingsForm } from "./settings-form";
import Link from "next/link";

export default async function EmployerSettings() {
  const { supabase, user } = await requireEmployerUser();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("created_by", user.id)
    .maybeSingle();

  const roles = getUserRoles(user);
  const hasCandidate = roles.includes("candidate");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company settings</h1>
        <p className="text-muted-foreground">
          {company ? "Keep your public company profile up to date." : "Create a company profile before you can post jobs."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company profile</CardTitle>
          <CardDescription>
            {company ? "Update hiring details, tax info, and verification." : "This is required before you can publish listings."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployerSettingsForm user={user} company={company} />
        </CardContent>
      </Card>

      {!hasCandidate && (
        <Card className="border-dashed border-[#01224F]/30">
          <CardHeader>
            <CardTitle>Also looking for a job?</CardTitle>
            <CardDescription>Add the Applicant role to this account so you can browse and apply without creating a second login.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addRole}>
              <input type="hidden" name="role" value="candidate" />
              <Button type="submit" variant="outline">Register as Applicant</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {hasCandidate && (
        <Card>
          <CardHeader>
            <CardTitle>Applicant dashboard</CardTitle>
            <CardDescription>This account already has an Applicant role.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>Go to Applicant dashboard</Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
