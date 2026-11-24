import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getUserRoles, hasCompletedOnboarding, onboardingPath } from "@/utils/auth"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const baseUrl = process.env.AUTH_URL || requestUrl.origin
  const intent = requestUrl.searchParams.get("intent")

  const session = await auth()

  if (!session || !(session as any).supabaseAccessToken) {
    return NextResponse.redirect(new URL("/login?message=Google+sign-in+failed", baseUrl))
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
    return NextResponse.redirect(new URL("/login?message=Could+not+create+session", baseUrl))
  }

  // Clear temporary Auth.js cookies now that Supabase session is safely established.
  // This prevents the Cookie header from bloating and hitting Netlify's 8KB HTTP 400 limit.
  for (const c of cookieStore.getAll()) {
    if (c.name.includes("authjs")) {
      cookieStore.delete(c.name);
    }
  }

  let user = data.user

  // If user signed up with an intent (employer or candidate), ensure metadata is set
  if (intent === "employer" && !hasCompletedOnboarding(user, "employer")) {
    const fullName = String(user.user_metadata?.full_name || user.user_metadata?.name || "").trim()
    const [first_name, ...rest] = fullName.split(" ")
    const updated = await supabase.auth.updateUser({
      data: {
        first_name: user.user_metadata?.first_name || first_name || "",
        last_name: user.user_metadata?.last_name || rest.join(" "),
        role: "employer",
        roles: Array.from(new Set(["employer", ...getUserRoles(user)])),
        onboarded: false,
        employer_onboarded: false,
      },
    })
    if (updated.data.user) user = updated.data.user
    return NextResponse.redirect(new URL(onboardingPath("employer"), baseUrl), 303)
  }

  if (intent === "candidate" && !hasCompletedOnboarding(user, "candidate")) {
    const fullName = String(user.user_metadata?.full_name || user.user_metadata?.name || "").trim()
    const [first_name, ...rest] = fullName.split(" ")
    const updated = await supabase.auth.updateUser({
      data: {
        first_name: user.user_metadata?.first_name || first_name || "",
        last_name: user.user_metadata?.last_name || rest.join(" "),
        role: "candidate",
        roles: Array.from(new Set(["candidate", ...getUserRoles(user)])),
        onboarded: false,
        candidate_onboarded: false,
      },
    })
    if (updated.data.user) user = updated.data.user
    return NextResponse.redirect(new URL(onboardingPath("candidate"), baseUrl), 303)
  }

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

  const targetUrl = new URL(redirectPath, baseUrl)
  targetUrl.search = ""
  return NextResponse.redirect(targetUrl, 303)
}
