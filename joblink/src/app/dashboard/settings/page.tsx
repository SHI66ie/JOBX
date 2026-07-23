import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/utils/supabase/server"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
      
      <div className="glass-panel rounded-2xl p-6 relative z-10">
        <h2 className="text-xl font-semibold mb-6">Account</h2>
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            <span className="font-medium text-muted-foreground">Email:</span> {user?.email}
          </p>
          <p className="text-sm">
            <span className="font-medium text-muted-foreground">Name:</span> {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </p>
          <p className="text-sm">
            <span className="font-medium text-muted-foreground">Role:</span> <span className="capitalize">{user?.user_metadata?.role}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
