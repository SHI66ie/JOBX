import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { actionSetCompanyVerification } from "@/app/actions/admin";

const PAGE_SIZE = 25;

type CompanyRow = {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  verification_status: string | null;
  created_at: string;
};

const STATUS_BADGE: Record<string, string> = {
  verified: "bg-green-100 text-green-700",
  unverified: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
};

export default async function AdminCompaniesPage({
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
    .from("companies")
    .select("id, name, website, description, verification_status, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  const { data: companies, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    return `/admin/companies${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            {count ?? 0} company profile{count !== 1 ? "s" : ""} · Page {page} of {totalPages || 1}
          </p>
        </div>
        <Link href="/admin" className={buttonVariants({ variant: "default" })}>
          Back to Admin
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/companies" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by company name…"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" className={buttonVariants({ variant: "secondary" })}>
          Search
        </button>
        {q && (
          <Link href="/admin/companies" className={buttonVariants({ variant: "ghost" })}>
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {companies && companies.length > 0 ? (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Website</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(companies as CompanyRow[]).map((c) => {
                const status = c.verification_status ?? "unverified";
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name}</p>
                      {c.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          {c.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_BADGE[status] ?? "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {status !== "verified" && (
                          <form
                            action={async () => {
                              "use server";
                              await actionSetCompanyVerification(c.id, "verified");
                            }}
                          >
                            <button
                              type="submit"
                              className="text-xs font-medium text-green-600 hover:underline"
                            >
                              Verify
                            </button>
                          </form>
                        )}
                        {status !== "unverified" && (
                          <form
                            action={async () => {
                              "use server";
                              await actionSetCompanyVerification(c.id, "unverified");
                            }}
                          >
                            <button
                              type="submit"
                              className="text-xs font-medium text-yellow-600 hover:underline"
                            >
                              Unverify
                            </button>
                          </form>
                        )}
                        {status !== "suspended" && (
                          <form
                            action={async () => {
                              "use server";
                              await actionSetCompanyVerification(c.id, "suspended");
                            }}
                          >
                            <button
                              type="submit"
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Suspend
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="py-12 text-center">
          <CardHeader>
            <CardTitle>No companies found</CardTitle>
            <CardDescription>
              {q ? `No results for "${q}"` : "There are no company profiles yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={buildUrl(page - 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              ← Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildUrl(page + 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
