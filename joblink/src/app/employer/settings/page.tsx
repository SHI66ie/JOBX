import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { upsertCompanyProfile } from "../actions";

export default async function EmployerSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/employer");
  }

  // Get existing company profile
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("created_by", user.id)
    .single();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-muted-foreground">Manage your company profile information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            {company ? "Update your company information" : "Create your company profile to start posting jobs"}
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
    </div>
  );
}
