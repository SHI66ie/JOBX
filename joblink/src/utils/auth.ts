/** Get roles array with backward compatibility for old single `role` field */
export function getUserRoles(user: any): string[] {
  const meta = user?.user_metadata || {}
  if (Array.isArray(meta.roles) && meta.roles.length > 0) {
    return meta.roles
  }
  return [meta.role || 'candidate']
}

export function isGoogleUser(user: any): boolean {
  const identities = user?.identities || []
  if (Array.isArray(identities) && identities.some((item: { provider?: string }) => item.provider === 'google')) {
    return true
  }
  return user?.app_metadata?.provider === 'google'
}
