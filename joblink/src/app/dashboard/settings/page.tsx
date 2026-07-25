import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { addRole } from "@/app/login/actions"
import { getUserRoles } from "@/utils/auth"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const roles = getUserRoles(user)
  const hasEmployer = roles.includes("employer")
  const hasCandidate = roles.includes("candidate")

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

      <div className="glass-panel rounded-2xl p-6 mb-8 relative z-10">
        <h2 className="text-xl font-semibold mb-6">Appearance</h2>

        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div>
            <h3 className="font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Toggle between light mode and the premium Joblink dark mode.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 mb-8 relative z-10">
        <h2 className="text-xl font-semibold mb-6">Account</h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            <span className="font-medium text-muted-foreground">Email:</span>{" "}
            {user?.email}
          </p>
          <p className="text-sm">
            <span className="font-medium text-muted-foreground">Name:</span>{" "}
            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </p>
          <p className="text-sm">
            <span className="font-medium text-muted-foreground">Roles:</span>{" "}
            <span className="capitalize">{roles.join(", ")}</span>
          </p>
        </div>
      </div>

      {/* Dual-role: Add Employer */}
      {!hasEmployer && (
        <div className="glass-panel rounded-2xl p-6 mb-8 relative z-10 border border-dashed border-[#00bcd4]/40">
          <h2 className="text-xl font-semibold mb-2">Become an Employer</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Want to post jobs and hire talent? Add the Employer role to this
            account. You will keep your Applicant profile.
          </p>
          <form action={addRole}>
            <input type="hidden" name="role" value="employer" />
            <Button type="submit" className="bg-[#00838f] hover:bg-[#005662]">
              Register as Employer
            </Button>
          </form>
        </div>
      )}

      {/* Dual-role: already has employer → link to it */}
      {hasEmployer && (
        <div className="glass-panel rounded-2xl p-6 relative z-10">
          <h2 className="text-xl font-semibold mb-2">Employer Dashboard</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You already have an Employer role on this account.
          </p>
          <Button asChild variant="outline">
            <Link href="/employer/dashboard">Go to Employer Dashboard</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
