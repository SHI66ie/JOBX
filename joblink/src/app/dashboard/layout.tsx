import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's role from the public.users table
  const { data: userProfile } = await supabase
    .from("users")
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  const role = userProfile?.role || "candidate";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-black px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tighter text-primary">
            Joblink
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link
              href={`/dashboard/${role}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            {role === "employer" && (
              <Link
                href="/dashboard/company/post-job"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Post a Job
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            Welcome, {userProfile?.first_name || "User"}
          </span>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
