'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { getUserRoles, isGoogleUser } from '@/utils/auth'

function signupUrl(role: string, message?: string) {
  const params = new URLSearchParams()
  if (role === 'employer') params.set('role', 'employer')
  if (message) params.set('message', message)
  const query = params.toString()
  return query ? `/signup?${query}` : '/signup'
}

async function ensureEmployerCompany(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  firstName: string,
  lastName: string
) {
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('created_by', userId)
    .maybeSingle()

  if (existing) return

  const name = [firstName, lastName].filter(Boolean).join(' ') || 'My company'
  await supabase.from('companies').insert({
    name,
    created_by: userId,
  })
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

  const user = data.user
  const roles = getUserRoles(user)

  if (user && !user.user_metadata?.onboarded && !isGoogleUser(user)) {
    await supabase.auth.updateUser({
      data: {
        onboarded: true,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        role: roles[0],
        roles,
      },
    })
    if (roles.includes('employer')) {
      await ensureEmployerCompany(
        supabase,
        user.id,
        user.user_metadata?.first_name || '',
        user.user_metadata?.last_name || ''
      )
    }
  }

  revalidatePath('/', 'layout')

  if (user && !user.user_metadata?.onboarded && isGoogleUser(user)) {
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
        onboarded: true,
        signup_method: 'email',
      },
    },
  })

  if (error) {
    return redirect(signupUrl(role, error.message))
  }

  if (data.user && !data.session) {
    return redirect(
      signupUrl(role, 'Check your email to confirm your account, then sign in. Your details are already saved.')
    )
  }

  if (data.user && role === 'employer') {
    await ensureEmployerCompany(supabase, data.user.id, first_name, last_name)
  }

  revalidatePath('/', 'layout')
  redirect(role === 'employer' ? '/employer/dashboard' : '/dashboard')
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin') || 'http://localhost:3000'
  const role = formData?.get('role') === 'employer' ? 'employer' : ''
  const callback = role
    ? `${origin}/auth/callback?intent=employer`
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
      redirect('/employer/dashboard')
    }
    redirect('/dashboard')
  }

  const newRoles = [...currentRoles, role]
  const { error } = await supabase.auth.updateUser({
    data: {
      roles: newRoles,
      role: newRoles.includes('employer') ? 'employer' : newRoles[0],
      onboarded: isGoogleUser(user) && role === 'employer' ? false : true,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (role === 'employer' && !isGoogleUser(user)) {
    await ensureEmployerCompany(
      supabase,
      user.id,
      user.user_metadata?.first_name || '',
      user.user_metadata?.last_name || ''
    )
  }

  revalidatePath('/', 'layout')
  if (role === 'employer' && isGoogleUser(user)) {
    redirect('/onboarding?role=employer')
  }
  if (role === 'employer') {
    redirect('/employer/settings')
  }
  redirect('/dashboard')
}
