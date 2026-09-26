import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_ADMIN_STATS, MOCK_COMPANY, MOCK_JOBS, MOCK_USER } from "@/lib/mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export default async function AdminDashboard() {
  let userProfile = { role: "admin", first_name: "Admin" };
  
  if (!USE_MOCK) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/");
    }

    const { data } = await supabase
      .from("users")
      .select("role, first_name")
      .eq("id", user.id)
      .single();
      
    if (data) {
      userProfile = data as any;
    }

    if (userProfile?.role !== "admin") {
      redirect("/dashboard");
    }
  }

  let companyCount = { count: USE_MOCK ? MOCK_ADMIN_STATS.totalCompanies : 0 };
  let jobCount = { count: USE_MOCK ? MOCK_ADMIN_STATS.totalJobs : 0 };
  let userCount = { count: USE_MOCK ? MOCK_ADMIN_STATS.totalUsers : 0 };
  
  let latestCompanies: any[] = USE_MOCK ? [MOCK_COMPANY] : [];
  let latestJobs: any[] = USE_MOCK ? MOCK_JOBS.slice(0, 3) : [];
  let latestUsers: any[] = USE_MOCK ? [{ ...MOCK_USER, first_name: MOCK_USER.user_metadata.full_name, role: "employer" }] : [];

  if (!USE_MOCK) {
    const adminClient = await createAdminClient();

    const [
      companyCountRes,
      jobCountRes,
      userCountRes,
      latestCompaniesRes,
      latestJobsRes,
      latestUsersRes,
    ] = await Promise.all([
      adminClient.from("companies").select("id", { count: "exact", head: true }),
      adminClient.from("jobs").select("id", { count: "exact", head: true }),
      adminClient.from("users").select("id", { count: "exact", head: true }),
      adminClient
        .from("companies")
        .select("id, name, website")
        .order("created_at", { ascending: false })
        .limit(3),
      adminClient
        .from("jobs")
        .select("id, title, location, type, status, company_id")
        .order("created_at", { ascending: false })
        .limit(3),
      adminClient
        .from("users")
        .select("id, first_name, last_name, role, email")
        .order("created_at", { ascending: false })
    ]);
    
    companyCount = companyCountRes;
    jobCount = jobCountRes;
    userCount = userCountRes;
    latestCompanies = latestCompaniesRes.data ?? [];
    latestJobs = latestJobsRes.data ?? [];
    latestUsers = latestUsersRes.data ?? [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {userProfile?.first_name || "Admin"}. Monitor the platform and take action.
            </p>
          </div>
          <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
            Go to Dashboard
          </Link>
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
          <CardHeader>
            <CardTitle>Recent companies</CardTitle>
            <CardDescription>Quick preview of newly added company profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestCompanies && latestCompanies.length > 0 ? (
              latestCompanies.map((company) => (
                <div key={company.id} className="rounded-lg border p-4">
                  <p className="font-semibold">{company.name}</p>
                  <p className="text-sm text-muted-foreground">{company.website || "No website"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No companies available yet.</p>
            )}
            <Link href="/admin/companies" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              View all companies
            </Link>
          </CardContent>
        </Card>

        <Card className="space-y-4 p-6">
          <CardHeader>
            <CardTitle>Recent jobs</CardTitle>
            <CardDescription>Latest job listings submitted by employers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestJobs && latestJobs.length > 0 ? (
              latestJobs.map((job) => (
                <div key={job.id} className="rounded-lg border p-4">
                  <p className="font-semibold">{job.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.location} · {job.type} · {job.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No jobs available yet.</p>
            )}
            <Link href="/admin/jobs" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              View all jobs
            </Link>
          </CardContent>
        </Card>

        <Card className="space-y-4 p-6">
          <CardHeader>
            <CardTitle>Recent users</CardTitle>
            <CardDescription>Newest registered users and their roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestUsers && latestUsers.length > 0 ? (
              latestUsers.map((userItem) => (
                <div key={userItem.id} className="rounded-lg border p-4">
                  <p className="font-semibold">{userItem.first_name} {userItem.last_name}</p>
                  <p className="text-sm text-muted-foreground">{userItem.email} · {userItem.role}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No users available yet.</p>
            )}
            <Link href="/admin/users" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              View all users
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="space-y-6 p-6">
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
  );
}
