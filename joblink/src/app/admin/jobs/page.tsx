import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { actionSetJobStatus } from "@/app/actions/admin";

const PAGE_SIZE = 25;

type JobRow = {
  id: string;
  title: string;
  location: string | null;
  type: string | null;
  status: string;
  company_id: string | null;
  created_at: string;
  companies: { name: string } | null;
};

const STATUS_TABS = ["all", "published", "draft", "closed"] as const;
type StatusFilter = (typeof STATUS_TABS)[number];

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  closed: "bg-neutral-100 text-neutral-600",
};

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const {
    q = "",
    status: statusParam = "all",
    page: pageStr = "1",
  } = await searchParams;
  const statusFilter: StatusFilter = STATUS_TABS.includes(statusParam as StatusFilter)
    ? (statusParam as StatusFilter)
    : "all";
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
    .from("jobs")
    .select(
      "id, title, location, type, status, company_id, created_at, companies(name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  if (q.trim()) {
    query = query.ilike("title", `%${q.trim()}%`);
  }

  const { data: jobs, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildUrl = (opts: { p?: number; s?: string; search?: string }) => {
    const params = new URLSearchParams();
    const s = opts.s !== undefined ? opts.s : statusFilter;
    const search = opts.search !== undefined ? opts.search : q;
    if (s !== "all") params.set("status", s);
    if (search) params.set("q", search);
    const p = opts.p ?? 1;
    if (p > 1) params.set("page", String(p));
    return `/admin/jobs${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            {count ?? 0} job{count !== 1 ? "s" : ""}
            {statusFilter !== "all" ? ` · ${statusFilter}` : ""} · Page {page} of{" "}
            {totalPages || 1}
          </p>
        </div>
        <Link href="/admin" className={buttonVariants({ variant: "default" })}>
          Back to Admin
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={buildUrl({ s, p: 1 })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form method="GET" action="/admin/jobs" className="flex gap-2">
        {statusFilter !== "all" && (
          <input type="hidden" name="status" value={statusFilter} />
        )}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by job title…"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" className={buttonVariants({ variant: "secondary" })}>
          Search
        </button>
        {q && (
          <Link
            href={buildUrl({ search: "", p: 1 })}
            className={buttonVariants({ variant: "ghost" })}
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      {jobs && jobs.length > 0 ? (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Location / Type</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Posted</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(jobs as unknown as JobRow[]).map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{job.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {job.companies?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[job.location, job.type].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[job.status] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {job.status !== "published" && (
                        <form
                          action={async () => {
                            "use server";
                            await actionSetJobStatus(job.id, "published");
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-medium text-green-600 hover:underline"
                          >
                            Publish
                          </button>
                        </form>
                      )}
                      {job.status !== "draft" && (
                        <form
                          action={async () => {
                            "use server";
                            await actionSetJobStatus(job.id, "draft");
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-medium text-yellow-600 hover:underline"
                          >
                            Draft
                          </button>
                        </form>
                      )}
                      {job.status !== "closed" && (
                        <form
                          action={async () => {
                            "use server";
                            await actionSetJobStatus(job.id, "closed");
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-medium text-red-600 hover:underline"
                          >
                            Close
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
            <CardTitle>No jobs found</CardTitle>
            <CardDescription>
              {q
                ? `No jobs matching "${q}"`
                : statusFilter !== "all"
                ? `No ${statusFilter} jobs.`
                : "There are no job listings yet."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ p: page - 1 })}
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
              href={buildUrl({ p: page + 1 })}
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
