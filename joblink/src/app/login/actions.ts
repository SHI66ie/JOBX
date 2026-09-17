'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { getUserRoles, hasCompletedOnboarding, isGoogleUser, onboardingPath } from '@/utils/auth'

function signupUrl(role: string, message?: string) {
  const params = new URLSearchParams()
  if (role === 'employer') params.set('role', 'employer')
  if (message) params.set('message', message)
  const query = params.toString()
  return query ? `/signup?${query}` : '/signup'
}

function afterAuthPath(user: { user_metadata?: Record<string, unknown> } | null) {
  if (!user) return '/login'
  const roles = getUserRoles(user)

  if (isGoogleUser(user) && !hasCompletedOnboarding(user, 'candidate') && !hasCompletedOnboarding(user, 'employer') && !user.user_metadata?.role) {
    return '/?welcome=1'
  }

  if (roles.includes('employer') && !hasCompletedOnboarding(user, 'employer')) {
    return onboardingPath('employer')
  }
  if (roles.includes('candidate') && !hasCompletedOnboarding(user, 'candidate')) {
    return onboardingPath('candidate')
  }
  if (!hasCompletedOnboarding(user, 'employer') && !hasCompletedOnboarding(user, 'candidate')) {
    return onboardingPath(roles.includes('employer') ? 'employer' : 'candidate')
  }
  if (roles.includes('employer') && hasCompletedOnboarding(user, 'employer')) {
    return '/employer/dashboard'
  }
  return '/dashboard'
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect(afterAuthPath(data.user))
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const first_name = String(formData.get('first_name') || '').trim()
  const last_name = String(formData.get('last_name') || '').trim()
  const role = (formData.get('role') as string) === 'employer' ? 'employer' : 'candidate'

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return redirect(
      signupUrl(
        role,
        'Password must be at least 8 characters long and contain at least one uppercase letter and one special character.'
      )
    )
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        role,
        roles: [role],
        onboarded: false,
        candidate_onboarded: role === 'candidate' ? false : undefined,
        employer_onboarded: role === 'employer' ? false : undefined,
        signup_method: 'email',
      },
    },
  })

  if (error) {
    return redirect(signupUrl(role, error.message))
  }

  if (data.user && !data.session) {
    return redirect(
      signupUrl(role, 'Check your email to confirm your account, then sign in to finish setup.')
    )
  }

  revalidatePath('/', 'layout')
  redirect(onboardingPath(role))
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient()
  const h = await headers()
  const forwardedHost = h.get('x-forwarded-host') || h.get('host')
  const proto = h.get('x-forwarded-proto') || 'https'
  const origin = h.get('origin') || (forwardedHost ? `${proto}://${forwardedHost}` : '') || process.env.NEXT_PUBLIC_SITE_URL || 'https://jomponline.com'

  const role = formData?.get('role') === 'employer' ? 'employer' : formData?.get('role') === 'candidate' ? 'candidate' : ''
  const callback = role
    ? `${origin}/auth/callback?intent=${role}`
    : `${origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callback,
    },
  })

  if (data.url) {
    redirect(data.url)
  }

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }
}

export async function addRole(formData: FormData) {
  const supabase = await createClient()
  const role = formData.get('role') === 'employer' ? 'employer' : 'candidate'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentRoles = getUserRoles(user)
  if (currentRoles.includes(role) && hasCompletedOnboarding(user, role)) {
    redirect(role === 'employer' ? '/employer/dashboard' : '/dashboard')
  }

  const newRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role]
  const { error } = await supabase.auth.updateUser({
    data: {
      roles: newRoles,
      role,
      ...(role === 'employer' ? { employer_onboarded: false } : { candidate_onboarded: false }),
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  redirect(onboardingPath(role))
}
