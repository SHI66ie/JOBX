import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getUserRoles, hasCompletedOnboarding, isGoogleUser, onboardingPath } from '@/utils/auth'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const intent = requestUrl.searchParams.get('intent')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && isGoogleUser(user) && intent === 'employer' && !hasCompletedOnboarding(user, 'employer')) {
        const fullName = String(user.user_metadata?.full_name || user.user_metadata?.name || '').trim()
        const [first_name, ...rest] = fullName.split(' ')
        await supabase.auth.updateUser({
          data: {
            first_name: user.user_metadata?.first_name || first_name || '',
            last_name: user.user_metadata?.last_name || rest.join(' '),
            role: 'employer',
            roles: Array.from(new Set(['employer', ...getUserRoles(user)])),
            onboarded: false,
            employer_onboarded: false,
          },
        })
        return NextResponse.redirect(new URL(onboardingPath('employer'), requestUrl.origin))
      }

      if (user && isGoogleUser(user) && intent === 'candidate' && !hasCompletedOnboarding(user, 'candidate')) {
        const fullName = String(user.user_metadata?.full_name || user.user_metadata?.name || '').trim()
        const [first_name, ...rest] = fullName.split(' ')
        await supabase.auth.updateUser({
          data: {
            first_name: user.user_metadata?.first_name || first_name || '',
            last_name: user.user_metadata?.last_name || rest.join(' '),
            role: 'candidate',
            roles: Array.from(new Set(['candidate', ...getUserRoles(user)])),
            onboarded: false,
            candidate_onboarded: false,
          },
        })
        return NextResponse.redirect(new URL(onboardingPath('candidate'), requestUrl.origin))
      }

      if (user && !hasCompletedOnboarding(user, 'employer') && !hasCompletedOnboarding(user, 'candidate')) {
        return NextResponse.redirect(new URL('/?welcome=1', requestUrl.origin))
      }

      const roles = getUserRoles(user)
      const redirectUrl =
        roles.includes('employer') && hasCompletedOnboarding(user, 'employer')
          ? '/employer/dashboard'
          : hasCompletedOnboarding(user, 'candidate')
            ? '/dashboard'
            : onboardingPath(roles.includes('employer') ? 'employer' : 'candidate')

      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    }
  }

  return NextResponse.redirect(
    new URL('/?message=Could not authenticate user', requestUrl.origin)
  )
}
