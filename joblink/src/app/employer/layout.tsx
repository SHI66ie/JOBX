import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserRoles } from "@/utils/auth";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/employer/dashboard", label: "Dashboard" },
  { href: "/employer/jobs", label: "Jobs" },
  { href: "/employer/applicants", label: "Applicants" },
  { href: "/employer/jobs/create", label: "Post a Job" },
  { href: "/employer/settings", label: "Company" },
];

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
    redirect("/login");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("created_by", user.id)
    .maybeSingle();

  const companyName = company?.name || "Set up company";
  const roles = getUserRoles(user);
  const hasCandidate = roles.includes("candidate");

  return (
    <div className="auth-bg min-h-screen flex flex-col text-foreground transition-colors">
      <header className="sticky top-0 z-40 glass-panel border-b px-4 sm:px-6 h-16 flex items-center justify-between bg-white dark:bg-[#01224F]">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="text-[#01224F] dark:text-white shrink-0">
            <Logo variant="lockup" tone="current" className="h-10" markClassName="h-8 w-8" />
          </Link>
          <nav className="hidden md:flex gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#111111]/70 hover:text-[#01224F] dark:text-white/70 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {hasCandidate && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[#01224F] dark:text-white"
              >
                Applicant Mode
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#111111]/70 dark:text-white/70 hidden sm:inline-block truncate max-w-[160px]">
            {companyName}
          </span>
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </header>
      <nav className="md:hidden flex gap-3 overflow-x-auto px-4 py-3 border-b bg-white/80 dark:bg-[#01224F]/80">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-xs font-medium whitespace-nowrap text-[#111111]/70 hover:text-[#01224F] dark:text-white/70 dark:hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
