'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const role = formData.get('role') as string

  // Password validation: at least one uppercase, at least one special character, minimum 8 characters
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasUppercase || !hasSpecial || password.length < 8) {
    return redirect('/signup?message=Password must be at least 8 characters long and contain at least one uppercase letter and one special character.')
  }

  // Note: the `options.data` is stored in `raw_user_meta_data` in auth.users
  // We can use a Postgres trigger to automatically insert into public.users.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
    },
  })

  if (error) {
    return redirect('/signup?message=Could not create user')
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

import { headers } from 'next/headers'

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // Try to get the origin from headers, or fallback to Vercel URL, or localhost
  let origin = (await headers()).get('origin')
  if (!origin) {
    origin = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000')
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}
