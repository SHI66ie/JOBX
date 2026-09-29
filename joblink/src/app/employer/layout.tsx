import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { getUserRoles, hasCompletedOnboarding, onboardingPath } from "@/utils/auth";
import { JompMark, JompWordmark } from "@/components/brand/logo";
import { DashboardNavLinks, DashboardNavMobile, UserMenu } from "@/components/dashboard/dashboard-nav";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { Icon } from "@/components/ui/icon";

const NAV = [
  { href: "/employer/dashboard", label: "Overview", exact: true },
  { href: "/employer/jobs", label: "Jobs" },
  { href: "/employer/applicants", label: "Applicants" },
  { href: "/employer/settings", label: "Settings" },
];

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasCompletedOnboarding(user, "employer")) {
    redirect(onboardingPath("employer"));
  }

  const { data: company } = await supabase.from("companies").select("id, name").eq("created_by", user.id).maybeSingle();

  const meta = user.user_metadata ?? {};
  const name = [meta.first_name, meta.last_name].filter(Boolean).join(" ") || company?.name || "Employer";
  const avatarUrl = String(meta.avatar_url || meta.picture || "") || null;
  const hasCandidate = getUserRoles(user).includes("candidate");

  return (
    <div className="app-theme flex min-h-screen flex-col bg-surface text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              href="/employer/dashboard"
              aria-label="JOMP employer home"
              className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <JompMark tone="current" className="h-8 w-8 text-[#01224F] dark:text-white" />
              <JompWordmark tone="current" className="h-[18px] w-auto text-[#01224F] dark:text-white" />
            </Link>
            <DashboardNavLinks items={NAV} />
          </div>

          <div className="flex items-center gap-2">
            {hasCandidate ? (
              <Link
                href="/dashboard"
                className="hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-700 ring-1 ring-inset ring-neutral-200 transition-colors hover:bg-neutral-50 hover:text-neutral-900 lg:block"
              >
                Job seeker mode
              </Link>
            ) : null}
            <Link
              href="/employer/jobs/create"
              className="hidden h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-medium text-brand-fg transition-colors hover:bg-brand-hover sm:inline-flex"
            >
              <Icon icon={Add01Icon} size={16} strokeWidth={2} />
              Post a job
            </Link>
            <ThemeSwitch />
            <UserMenu
              name={name}
              email={user.email || ""}
              avatarUrl={avatarUrl}
              settingsHref="/employer/settings"
              switchTo={hasCandidate ? { href: "/dashboard", label: "Job seeker mode" } : undefined}
            />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DashboardNavMobile items={[...NAV, { href: "/employer/jobs/create", label: "Post a job" }]} />
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
