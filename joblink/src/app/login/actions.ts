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
    return redirect('/?message=Could not authenticate user')
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
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const role = (formData.get('role') as string) || 'candidate'

  // Password validation
  const hasUppercase = /[A-Z]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  if (!hasUppercase || !hasSpecial || password.length < 8) {
    return redirect(
      '/signup?message=Password must be at least 8 characters long and contain at least one uppercase letter and one special character.'
    )
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role, // keep for backward compatibility
        roles: [role], // dual-role support
      },
    },
  })

  if (error) {
    return redirect('/signup?message=Could not create user')
  }

  // If email confirmation is required there will be no session yet
  if (!data.session) {
    return redirect(
      '/signup?message=Check your email to confirm your account before signing in.'
    )
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  let origin = (await headers()).get('origin')
  if (!origin) {
    origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000')
  }

  // Ensure origin is a valid absolute URL to prevent Supabase relative redirects
  if (origin) {
    origin = origin.trim()
    if (!origin.startsWith('http')) {
      origin = `https://${origin}`
    }
  }

  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}

/** Add a second role to an existing user (dual-role support) */
export async function addRole(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const newRole = formData.get('role') as string
  if (!['employer', 'candidate'].includes(newRole)) {
    throw new Error('Invalid role')
  }

  const currentRoles = getUserRoles(user)

  if (currentRoles.includes(newRole)) {
    // already has it
    if (newRole === 'employer') {
      redirect('/employer/settings')
    }
    redirect('/dashboard')
  }

  const updatedRoles = [...currentRoles, newRole]

  const { error } = await supabase.auth.updateUser({
    data: {
      roles: updatedRoles,
      // keep primary role as the newly added one for login preference
      role: newRole,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')

  if (newRole === 'employer') {
    // send them to create company profile
    redirect('/employer/settings')
  }

  redirect('/dashboard')
}
