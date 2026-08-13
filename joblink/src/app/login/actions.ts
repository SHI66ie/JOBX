'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { getUserRoles } from '@/utils/auth'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  const roles = getUserRoles(data.user)

  revalidatePath('/', 'layout')

  // Prefer employer dashboard if they have that role, otherwise applicant
  if (roles.includes('employer')) {
    redirect('/employer/dashboard')
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const role = (formData.get('role') as string) || 'candidate'

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return redirect(
      '/signup?message=Password must be at least 8 characters long and contain at least one uppercase letter and one special character.'
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
      },
    },
  })

  if (error) {
    return redirect('/signup?message=Could not create user')
  }

  if (data.user && !data.session) {
    return redirect(
      '/signup?message=Check your email to confirm your account before signing in.'
    )
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'

  // Ensure origin is a valid absolute URL to prevent Supabase relative redirects
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }

  if (error) {
    redirect('/login?message=Could not sign in with Google')
  }
}

export async function addRole(formData: FormData) {
  const supabase = await createClient()
  const role = formData.get('role') as string

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentRoles = getUserRoles(user)
  if (currentRoles.includes(role)) {
    if (role === 'employer') {
      redirect('/employer/settings')
    }
    redirect('/dashboard')
  }

  const newRoles = [...currentRoles, role]
  const { error } = await supabase.auth.updateUser({
    data: { roles: newRoles, role: newRoles[0] },
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  if (role === 'employer') {
    redirect('/employer/settings')
  }
  redirect('/dashboard')
}
