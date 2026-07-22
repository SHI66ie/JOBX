import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminCompaniesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, website, description")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground">
          Review registered company profiles and verify any pending information.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies && companies.length > 0 ? (
          companies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{company.name}</CardTitle>
                <CardDescription>{company.website || "No website provided"}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {company.description || "No description available."}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <CardHeader>
              <CardTitle>No companies found</CardTitle>
              <CardDescription>There are no company profiles in the system yet.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
