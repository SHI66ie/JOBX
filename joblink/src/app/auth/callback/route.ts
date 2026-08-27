import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getUserRoles, isGoogleUser } from '@/utils/auth'

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

      // Google users choose a path on the landing page, then enter details.
      if (user && !user.user_metadata?.onboarded && isGoogleUser(user)) {
        return NextResponse.redirect(new URL('/?welcome=1', requestUrl.origin))
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
