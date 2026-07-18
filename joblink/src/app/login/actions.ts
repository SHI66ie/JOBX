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
    return redirect('/login?message=Could not authenticate user')
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
  // Users will need to verify their email depending on Supabase settings.
  // For now, redirect to login with a success message.
  redirect('/login?message=Check your email to confirm your account (or just log in if email confirmation is disabled)')
}
