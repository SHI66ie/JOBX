import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user is newly created or hasn't finished onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !user.user_metadata?.onboarded) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
      }
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/?message=Could not authenticate user', requestUrl.origin))
}
