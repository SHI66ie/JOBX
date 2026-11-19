import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getUserRoles, hasCompletedOnboarding, onboardingPath } from "@/utils/auth"

export async function GET() {
  const session = await auth()

  if (!session || !(session as any).supabaseAccessToken) {
    return NextResponse.redirect(new URL("/login?message=Google+sign-in+failed", process.env.AUTH_URL || "https://jomponline.com"))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Set the real Supabase session from the tokens we got earlier
  const { data, error } = await supabase.auth.setSession({
    access_token: (session as any).supabaseAccessToken,
    refresh_token: (session as any).supabaseRefreshToken,
  })

  if (error || !data.user) {
    console.error("Bridge setSession error:", error)
    return NextResponse.redirect(new URL("/login?message=Could+not+create+session", process.env.AUTH_URL || "https://jomponline.com"))
  }

  const user = data.user
  const roles = getUserRoles(user)

  let redirectPath = "/dashboard"

  if (!hasCompletedOnboarding(user, "employer") && !hasCompletedOnboarding(user, "candidate")) {
    redirectPath = "/?welcome=1"
  } else if (roles.includes("employer") && !hasCompletedOnboarding(user, "employer")) {
    redirectPath = onboardingPath("employer")
  } else if (roles.includes("candidate") && !hasCompletedOnboarding(user, "candidate")) {
    redirectPath = onboardingPath("candidate")
  } else if (roles.includes("employer") && hasCompletedOnboarding(user, "employer")) {
    redirectPath = "/employer/dashboard"
  }

  return NextResponse.redirect(new URL(redirectPath, process.env.AUTH_URL || "https://jomponline.com"))
}

