import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user is newly created or hasn't finished onboarding
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && !user.user_metadata?.onboarded) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }
      
      // Redirect based on user role
      const userRole = user?.user_metadata?.role || 'candidate'
      const redirectUrl = userRole === 'employer' ? '/employer/dashboard' : '/dashboard'
      
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/?message=Could not authenticate user', requestUrl.origin))
}
