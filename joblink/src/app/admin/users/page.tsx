import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { actionSetUserRole } from "@/app/actions/admin";

const PAGE_SIZE = 25;

type UserRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  employer: "bg-blue-100 text-blue-700",
  candidate: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // ── Auth guard ──────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: userProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (userProfile?.role !== "admin") redirect("/dashboard");

  // ── Data ────────────────────────────────────────────────────────────────
  const adminClient = await createAdminClient();

  let query = adminClient
    .from("users")
    .select("id, first_name, last_name, email, role, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q.trim()) {
    query = query.or(
      `first_name.ilike.%${q.trim()}%,last_name.ilike.%${q.trim()}%,email.ilike.%${q.trim()}%`
    );
  }

  const { data: users, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number, search?: string) => {
    const params = new URLSearchParams();
    const s = search !== undefined ? search : q;
    if (s) params.set("q", s);
    if (p > 1) params.set("page", String(p));
    return `/admin/users${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            {count ?? 0} registered user{count !== 1 ? "s" : ""} · Page {page} of {totalPages || 1}
          </p>
        </div>
        <Link href="/admin" className={buttonVariants({ variant: "default" })}>
          Back to Admin
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/users" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className={buttonVariants({ variant: "secondary" })}
        >
          Search
        </button>
        {q && (
          <Link href="/admin/users" className={buttonVariants({ variant: "ghost" })}>
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {users && users.length > 0 ? (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(users as UserRow[]).map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {u.first_name || u.last_name
                      ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                      : <span className="text-muted-foreground italic">No name</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ROLE_BADGE[u.role ?? ""] ?? "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {u.role ?? "unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.role !== "suspended" ? (
                        <form
                          action={async () => {
                            "use server";
                            await actionSetUserRole(u.id, "suspended");
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Suspend
                          </button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await actionSetUserRole(u.id, "candidate");
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-medium text-green-600 hover:underline"
                          >
                            Restore
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardHeader>
            <CardTitle>No users found</CardTitle>
            <CardDescription>
              {q ? `No results for "${q}"` : "There are no registered users yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl(page - 1)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl(page + 1)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
