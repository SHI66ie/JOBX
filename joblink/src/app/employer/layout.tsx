import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

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

  // Check if they have a company profile
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("created_by", user.id)
    .single();

  const companyName = company?.name || "Employer";

  return (
    <div className="auth-bg min-h-screen flex flex-col text-foreground transition-colors">
      {/* Ambient Shapes (visible mostly in dark mode, or slightly in light mode) */}
      <div className="auth-shape auth-shape-cyan hidden dark:block" />
      <div className="auth-shape auth-shape-magenta hidden dark:block" />
      <div className="auth-shape auth-shape-orange hidden dark:block" />
      <div className="auth-shape auth-shape-red hidden dark:block" />

      <header className="sticky top-0 z-40 glass-panel border-b px-6 h-16 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tighter text-white">
            Joblink <span className="text-blue-200">Employer</span>
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link
              href="/employer/dashboard"
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/employer/jobs/create"
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Post a Job
            </Link>
            <Link
              href="/employer/settings"
              className="text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Company Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <span className="text-sm text-white/90 hidden sm:inline-block font-medium">
            {companyName}
          </span>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
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
