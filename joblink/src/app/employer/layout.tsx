import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserRoles } from "@/utils/auth";
import { Logo } from "@/components/brand/logo";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("created_by", user.id)
    .single();

  const companyName = company?.name || "Employer";
  const roles = getUserRoles(user);
  const hasCandidate = roles.includes("candidate");

  return (
    <div className="auth-bg min-h-screen flex flex-col text-foreground transition-colors">
      <header className="sticky top-0 z-40 glass-panel border-b px-6 h-16 flex items-center justify-between bg-white dark:bg-[#01224F]">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[#01224F] dark:text-white">
            <Logo variant="lockup" tone="current" className="h-10" markClassName="h-8 w-8" />
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/employer/dashboard" className="text-sm font-medium text-[#111111]/70 hover:text-[#01224F] dark:text-white/70 dark:hover:text-white">Dashboard</Link>
            <Link href="/employer/jobs/create" className="text-sm font-medium text-[#111111]/70 hover:text-[#01224F] dark:text-white/70 dark:hover:text-white">Post a Job</Link>
            <Link href="/employer/settings" className="text-sm font-medium text-[#111111]/70 hover:text-[#01224F] dark:text-white/70 dark:hover:text-white">Company Settings</Link>
            {hasCandidate && (
              <Link href="/dashboard" className="text-sm font-medium text-[#01224F] dark:text-white">
                Applicant Mode
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#111111]/70 dark:text-white/70 hidden sm:inline-block">{companyName}</span>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm">Sign Out</Button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
