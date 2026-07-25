import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

function getUserRoles(user: any): string[] {
  const meta = user?.user_metadata || {}
  if (Array.isArray(meta.roles) && meta.roles.length > 0) {
    return meta.roles
  }
  return [meta.role || 'candidate']
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && !user.user_metadata?.onboarded) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }

      const roles = getUserRoles(user)
      const redirectUrl = roles.includes('employer')
        ? '/employer/dashboard'
        : '/dashboard'

      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    }
  }

  return NextResponse.redirect(
    new URL('/?message=Could not authenticate user', requestUrl.origin)
  )
}
