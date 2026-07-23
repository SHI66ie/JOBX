import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: users } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, role")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Review platform users and their registered roles.
          </p>
        </div>
        <Link href="/admin" className={buttonVariants({ variant: "default" })}>
          Back to Admin
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users && users.length > 0 ? (
          users.map((userItem) => (
            <Card key={userItem.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{userItem.first_name} {userItem.last_name}</CardTitle>
                <CardDescription>{userItem.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Role: {userItem.role}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center">
            <CardHeader>
              <CardTitle>No users found</CardTitle>
              <CardDescription>There are no users registered in the system yet.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
