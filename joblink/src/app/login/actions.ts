'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { getUserRoles } from '@/utils/auth'

function signupUrl(role: string, message?: string) {
  const params = new URLSearchParams()
  if (role === 'employer') params.set('role', 'employer')
  if (message) params.set('message', message)
  const query = params.toString()
  return query ? `/signup?${query}` : '/signup'
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

  const roles = getUserRoles(data.user)

  revalidatePath('/', 'layout')

  if (!data.user?.user_metadata?.onboarded) {
    redirect('/?welcome=1')
  }

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
      },
    },
  })

  if (error) {
    return redirect(signupUrl(role, error.message))
  }

  if (data.user && !data.session) {
    return redirect(
      signupUrl(
        role,
        'Check your email to confirm your account, then sign in to finish setup.'
      )
    )
  }

  revalidatePath('/', 'layout')
  redirect('/?welcome=1')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'

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
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
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
      redirect(user.user_metadata?.onboarded ? '/employer/dashboard' : '/?welcome=1')
    }
    redirect('/dashboard')
  }

  const newRoles = [...currentRoles, role]
  const { error } = await supabase.auth.updateUser({
    data: {
      roles: newRoles,
      role: newRoles.includes('employer') ? 'employer' : newRoles[0],
      onboarded: role === 'employer' ? false : user.user_metadata?.onboarded,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  if (role === 'employer') {
    redirect('/?welcome=1')
  }
  redirect('/dashboard')
}
