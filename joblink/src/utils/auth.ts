import type { User } from "@supabase/supabase-js";

export type AuthUser =
  | User
  | {
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
      identities?: Array<{ provider?: string; [key: string]: unknown }>;
      [key: string]: unknown;
    };

/** Get roles array with backward compatibility for old single `role` field */
export function getUserRoles(user: AuthUser | null | undefined): string[] {
  const meta = (user?.user_metadata || {}) as Record<string, unknown>;
  const roles = meta.roles;
  if (Array.isArray(roles) && roles.length > 0) {
    return (roles as string[]).filter(Boolean);
  }
  return [typeof meta.role === "string" ? meta.role : "candidate"];
}

export function isGoogleUser(user: AuthUser | null | undefined): boolean {
  const identities = user?.identities || [];
  if (Array.isArray(identities) && identities.some((item) => item.provider === "google")) {
    return true;
  }
  const appMeta = user?.app_metadata as Record<string, unknown> | undefined;
  return appMeta?.provider === "google";
}

export function hasCompletedOnboarding(user: AuthUser | null | undefined, role: "employer" | "candidate"): boolean {
  const meta = (user?.user_metadata || {}) as Record<string, unknown>;
  const roles = getUserRoles(user);

  if (role === "employer") {
    if (meta.employer_onboarded === true) return true;
    if (meta.employer_onboarded === false) return false;
    return meta.onboarded === true && roles.includes("employer");
  }

  if (meta.candidate_onboarded === true) return true;
  if (meta.candidate_onboarded === false) return false;
  return meta.onboarded === true && roles.includes("candidate");
}

export function onboardingPath(role?: string | null): string {
  return role === "employer" ? "/onboarding?role=employer" : "/onboarding?role=candidate";
}
