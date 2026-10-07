import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { addRole } from "@/app/login/actions";
import { getUserRoles } from "@/utils/auth";
import { candidateProfileFromMeta } from "@/lib/profile";
import { signResume } from "@/lib/resumes";
import { ProfileForm, SettingsRow } from "@/components/dashboard/profile-form";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "account" ? "account" : "profile";
  const meta = user.user_metadata ?? {};
  const profile = candidateProfileFromMeta(meta);
  const cvLink = { path: profile.resumeUrl, url: await signResume(supabase, profile.resumeUrl) };
  const roles = getUserRoles(user);
  const hasEmployer = roles.includes("employer");
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Your profile";
  const avatarUrl = String(meta.avatar_url || meta.picture || "") || null;
  const provider = String(user.app_metadata?.provider || "email");

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <header className="flex items-center gap-4">
        <UserAvatar seed={user.email || fullName} imageUrl={avatarUrl} size={52} />
        <div className="min-w-0">
          <h1 className="truncate text-[22px] font-semibold tracking-[-0.025em] text-neutral-900">{fullName}</h1>
          <p className="truncate text-[14px] text-neutral-500">{profile.title || user.email}</p>
        </div>
      </header>

      <nav aria-label="Settings" className="mt-8 flex gap-6 border-b border-neutral-200">
        <Tab href="/dashboard/settings" active={tab === "profile"}>
          Profile
        </Tab>
        <Tab href="/dashboard/settings?tab=account" active={tab === "account"}>
          Account
        </Tab>
      </nav>

      <div key={tab}>
        {tab === "profile" ? (
          <ProfileForm initial={profile} cvLink={cvLink} />
        ) : (
          <div className="divide-y divide-neutral-100">
            <SettingsRow label="Email" hint="Where we send updates about your applications.">
              <p className="pt-0.5 text-[14px] text-neutral-900">{user.email}</p>
            </SettingsRow>

            <SettingsRow label="Sign-in method">
              <p className="pt-0.5 text-[14px] text-neutral-900">{provider === "google" ? "Google" : "Email and password"}</p>
            </SettingsRow>

            <SettingsRow label="Employer access" hint={hasEmployer ? "You can post jobs and review applicants." : "Post jobs from this same account."}>
              {hasEmployer ? (
                <Link href="/employer/dashboard" className="inline-flex text-[14px] font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
                  Open employer dashboard
                </Link>
              ) : (
                <form action={addRole}>
                  <input type="hidden" name="role" value="employer" />
                  <button type="submit" className="text-[14px] font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
                    Add employer access
                  </button>
                </form>
              )}
            </SettingsRow>

            <SettingsRow label="Sign out" hint="Sign out of JOMP on this device.">
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-[14px] font-medium text-red-600 underline decoration-red-200 underline-offset-4 hover:decoration-red-600">
                  Sign out
                </button>
              </form>
            </SettingsRow>
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mb-px border-b-2 pb-3 text-[14px] transition-colors",
        active ? "border-brand font-medium text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900",
      )}
    >
      {children}
    </Link>
  );
}
