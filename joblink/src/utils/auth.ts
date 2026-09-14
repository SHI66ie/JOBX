/** Get roles array with backward compatibility for old single `role` field */
export function getUserRoles(user: any): string[] {
  const meta = user?.user_metadata || {}
  if (Array.isArray(meta.roles) && meta.roles.length > 0) {
    return meta.roles.filter(Boolean)
  }
  return [meta.role || "candidate"]
}

export function isGoogleUser(user: any): boolean {
  const identities = user?.identities || []
  if (Array.isArray(identities) && identities.some((item: { provider?: string }) => item.provider === "google")) {
    return true
  }
  return user?.app_metadata?.provider === "google"
}

export function hasCompletedOnboarding(user: any, role: "employer" | "candidate"): boolean {
  const meta = user?.user_metadata || {}
  const roles = getUserRoles(user)

  if (role === "employer") {
    if (meta.employer_onboarded === true) return true
    if (meta.employer_onboarded === false) return false
    return meta.onboarded === true && roles.includes("employer")
  }

  if (meta.candidate_onboarded === true) return true
  if (meta.candidate_onboarded === false) return false
  return meta.onboarded === true && roles.includes("candidate")
}

export function onboardingPath(role?: string | null): string {
  return role === "employer" ? "/onboarding?role=employer" : "/onboarding?role=candidate"
}
