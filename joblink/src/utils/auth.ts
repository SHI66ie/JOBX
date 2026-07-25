/** Get roles array with backward compatibility for old single `role` field */
export function getUserRoles(user: any): string[] {
  const meta = user?.user_metadata || {}
  if (Array.isArray(meta.roles) && meta.roles.length > 0) {
    return meta.roles
  }
  // fallback for older accounts
  return [meta.role || 'candidate']
}
