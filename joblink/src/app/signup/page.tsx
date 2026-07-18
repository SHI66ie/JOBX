import Link from 'next/link'
import { signup } from '../login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Join Joblink as a candidate or employer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={signup}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" placeholder="Doe" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select name="role" required defaultValue="candidate">
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Job Seeker (Candidate)</SelectItem>
                  <SelectItem value="employer">Hiring Manager (Employer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchParams?.message && (
              <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                {searchParams.message}
              </p>
            )}
            
            <Button className="w-full" type="submit">
              Sign up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
