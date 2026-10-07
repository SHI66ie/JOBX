import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserRoles, hasCompletedOnboarding, onboardingPath } from "@/utils/auth";
import { JompMark, JompWordmark } from "@/components/brand/logo";
import { DashboardNavLinks, DashboardNavMobile, UserMenu } from "@/components/dashboard/dashboard-nav";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";

import { NotificationBell } from "@/components/notifications/notification-bell";

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
    redirect("/");
  }

  if (!hasCompletedOnboarding(user, "candidate")) {
    redirect(onboardingPath("candidate"));
  }

  const firstName = String(user.user_metadata?.first_name || "");
  const lastName = String(user.user_metadata?.last_name || "");
  const name = [firstName, lastName].filter(Boolean).join(" ") || "Applicant";
  const avatarUrl = String(user.user_metadata?.avatar_url || user.user_metadata?.picture || "") || null;
  const roles = getUserRoles(user);
  const hasEmployer = roles.includes("employer");
  const isAdmin = roles.includes("admin") || user.user_metadata?.role === "admin";

  const navItems = [
    { href: "/dashboard", label: "Find jobs" },
    { href: "/dashboard/applications", label: "My applications" },
    { href: "/dashboard/settings", label: "Settings" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="app-theme flex min-h-screen flex-col bg-surface text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              aria-label="JOMP home"
              className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <JompMark tone="current" className="h-8 w-8 text-[#01224F] dark:text-white" />
              <JompWordmark tone="current" className="h-[18px] w-auto text-[#01224F] dark:text-white" />
            </Link>
            <DashboardNavLinks items={navItems} />
          </div>

          <div className="flex items-center gap-2">
            {hasEmployer ? (
              <Link
                href="/employer/dashboard"
                className="hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200 transition-colors hover:bg-neutral-50 hover:text-neutral-900 lg:block"
              >
                Employer mode
              </Link>
            ) : null}
            <NotificationBell userId={user.id} />
            <ThemeSwitch />
            <UserMenu name={name} email={user.email || ""} avatarUrl={avatarUrl} hasEmployer={hasEmployer} />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DashboardNavMobile items={navItems} />
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
