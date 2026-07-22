import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  if (userProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const [companyCount, jobCount, userCount] = await Promise.all([
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {userProfile?.first_name || "Admin"}. Monitor the platform and take action.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{companyCount.count || 0}</div>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              Active company profiles on the platform.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{jobCount.count || 0}</div>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              All job listings posted by employers.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{userCount.count || 0}</div>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              Registered users across candidates and employers.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-4 p-6">
          <CardTitle className="text-lg font-semibold">Platform controls</CardTitle>
          <CardDescription>
            Use these links to manage platform content and review activity.
          </CardDescription>
          <div className="space-y-3">
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/admin/companies">Review Companies</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/admin/jobs">Review Jobs</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/admin/users">Review Users</Link>
            </Button>
          </div>
        </Card>

        <Card className="space-y-6 p-6 lg:col-span-2">
          <CardHeader>
            <CardTitle>Admin overview</CardTitle>
            <CardDescription>
              This page is reserved for admin access only. Use the navigation above to move between platform sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              Admin users can review company accounts, approve job listings, and manage user access. If you need to add more admin tools, create dedicated admin sub-pages under /admin.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
