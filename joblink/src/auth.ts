import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { createClient } from "@supabase/supabase-js"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          scope: "openid email profile",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !account.id_token) {
        return false
      }

      // Create a Supabase admin client to establish a real Supabase session
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // you need this key
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      // Sign the user into Supabase using the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: account.id_token,
      })

      if (error || !data.session) {
        console.error("Supabase signInWithIdToken error:", error)
        return false
      }

      // Store the Supabase session tokens so we can set cookies later
      // We'll pass them via the JWT temporarily
      ; (user as any).supabaseAccessToken = data.session.access_token
        ; (user as any).supabaseRefreshToken = data.session.refresh_token

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.supabaseAccessToken = (user as any).supabaseAccessToken
        token.supabaseRefreshToken = (user as any).supabaseRefreshToken
      }
      return token
    },
    async session({ session, token }) {
      ; (session as any).supabaseAccessToken = token.supabaseAccessToken
        ; (session as any).supabaseRefreshToken = token.supabaseRefreshToken
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
})

