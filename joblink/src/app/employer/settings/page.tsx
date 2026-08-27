import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { upsertCompanyProfile } from "../actions";
import { addRole } from "@/app/login/actions";
import { getUserRoles } from "@/utils/auth";
import { requireEmployerUser } from "@/lib/employer";
import { ACCOUNT_TYPES, HIRING_CATEGORIES, TEAM_SIZES, selectClassName } from "@/lib/employer-options";
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
  const verification = company?.verification_status || "unverified";

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
          <form action={upsertCompanyProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" name="first_name" defaultValue={user.user_metadata?.first_name || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" name="last_name" defaultValue={user.user_metadata?.last_name || ""} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Company name</Label>
              <Input id="name" name="name" defaultValue={company?.name || ""} placeholder="Your company name" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_type">I am a</Label>
                <select id="account_type" name="account_type" defaultValue={company?.account_type || "business-owner"} className={selectClassName}>
                  {ACCOUNT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_size">Team size</Label>
                <select id="team_size" name="team_size" defaultValue={company?.team_size || "small"} className={selectClassName}>
                  {TEAM_SIZES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hiring_for">What are you hiring for?</Label>
              <select id="hiring_for" name="hiring_for" defaultValue={company?.hiring_for || company?.industry || "business-owner"} className={selectClassName}>
                {HIRING_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About the company</Label>
              <Textarea id="description" name="description" defaultValue={company?.description || ""} placeholder="What you do, who you hire, and why people should join." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" defaultValue={company?.website || ""} placeholder="https://yourcompany.com" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vat_number">VAT / tax ID</Label>
                <Input id="vat_number" name="vat_number" defaultValue={company?.vat_number || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_registration">Business registration</Label>
                <Input id="business_registration" name="business_registration" defaultValue={company?.business_registration || ""} />
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">Verification status</p>
              <p className="text-sm capitalize text-muted-foreground">{verification}</p>
              {verification === "unverified" && (
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" name="request_verification" value="true" className="mt-1" />
                  <span>Request ID verification for higher spend limits and escrow</span>
                </label>
              )}
            </div>

            <Button type="submit">{company ? "Save profile" : "Create profile"}</Button>
          </form>
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
