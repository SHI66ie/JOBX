import Link from "next/link";
import { addRole } from "@/app/login/actions";
import { getUserRoles } from "@/utils/auth";
import { requireEmployerUser } from "@/lib/employer";
import { MOCK_COMPANY } from "@/lib/mock-data";
import { SettingsRow } from "@/components/dashboard/profile-form";
import { HiringProfileForm, type HiringProfile } from "@/components/employer/hiring-profile-form";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

type CompanyRow = {
  name?: string | null;
  account_type?: string | null;
  team_size?: string | null;
  hiring_for?: string | null;
  industry?: string | null;
  description?: string | null;
  website?: string | null;
  vat_number?: string | null;
  business_registration?: string | null;
  verification_status?: string | null;
};

export default async function EmployerSettings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { supabase, user } = await requireEmployerUser();
  const { tab: tabParam } = await searchParams;
  const tab = tabParam === "account" ? "account" : "profile";

  let company: CompanyRow | null = USE_MOCK ? MOCK_COMPANY : null;
  if (!USE_MOCK) {
    const { data, error } = await supabase.from("companies").select("*").eq("created_by", user.id).maybeSingle();
    if (error) console.error("[EmployerSettings] Supabase error:", error.message);
    else company = data;
  }

  const meta = user.user_metadata ?? {};
  const firstName = String(meta.first_name || "");
  const lastName = String(meta.last_name || "");
  const personName = [firstName, lastName].filter(Boolean).join(" ");
  const displayName = company?.name || personName || "Your hiring profile";
  const avatarUrl = String(meta.avatar_url || meta.picture || "") || null;
  const hasCandidate = getUserRoles(user).includes("candidate");
  const provider = String(user.app_metadata?.provider || "email");

  const initial: HiringProfile = {
    firstName,
    lastName,
    // A display name identical to the person's name means "use my own name".
    name: company?.name && company.name !== personName ? company.name : "",
    accountType: company?.account_type || String(meta.account_type || "business-owner"),
    hiringFor: String(company?.hiring_for || company?.industry || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3),
    teamSize: company?.team_size || String(meta.team_size || "small"),
    description: company?.description || "",
    website: company?.website || "",
    vatNumber: company?.vat_number || "",
    registration: company?.business_registration || "",
    verificationStatus: company?.verification_status || "unverified",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <header className="flex items-center gap-4">
        <UserAvatar seed={user.email || displayName} imageUrl={avatarUrl} size={52} />
        <div className="min-w-0">
          <h1 className="truncate text-[22px] font-semibold tracking-[-0.025em] text-neutral-900">{displayName}</h1>
          <p className="truncate text-[14px] text-neutral-500">{company?.name && personName && company.name !== personName ? personName : user.email}</p>
        </div>
      </header>

      <nav aria-label="Settings" className="mt-8 flex gap-6 border-b border-neutral-200">
        <Tab href="/employer/settings" active={tab === "profile"}>
          Hiring profile
        </Tab>
        <Tab href="/employer/settings?tab=account" active={tab === "account"}>
          Account
        </Tab>
      </nav>

      {tab === "profile" ? (
        <HiringProfileForm initial={initial} />
      ) : (
        <div className="divide-y divide-neutral-100">
          <SettingsRow label="Email" hint="Where we send applicant updates.">
            <p className="pt-0.5 text-[14px] text-neutral-900">{user.email}</p>
          </SettingsRow>
          <SettingsRow label="Sign-in method">
            <p className="pt-0.5 text-[14px] text-neutral-900">{provider === "google" ? "Google" : "Email and password"}</p>
          </SettingsRow>
          <SettingsRow label="Job seeker access" hint={hasCandidate ? "You can also browse and apply to jobs." : "Look for work from this same account."}>
            {hasCandidate ? (
              <Link href="/dashboard" className="inline-flex text-[14px] font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
                Open job seeker dashboard
              </Link>
            ) : (
              <form action={addRole}>
                <input type="hidden" name="role" value="candidate" />
                <button type="submit" className="text-[14px] font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
                  Add job seeker access
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
