import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { JobRow } from "@/components/dashboard/job-card";
import { JobFilters } from "@/components/dashboard/job-filters";
import { JobSearch } from "@/components/dashboard/job-search";
import { PromoCarousel } from "@/components/dashboard/promo-carousel";
import { EmptyJobsArt } from "@/components/dashboard/empty-jobs-art";
import { UserAvatar } from "@/components/ui/user-avatar";
import { JOB_TYPES, jobTypeOf, matchSkills, sanitizeSearch, type JobListing } from "@/lib/jobs";
import { candidateProfileFromMeta, profileStrength } from "@/lib/profile";
import { cn } from "@/lib/utils";

type SearchParams = { q?: string; type?: string | string[]; tab?: string; hide?: string };

export default async function JobBoardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const meta = user.user_metadata ?? {};
  const profile = candidateProfileFromMeta(meta);
  const skills = profile.skills;

  const params = await searchParams;
  const q = sanitizeSearch(params.q ?? "");
  const validTypes = new Set<string>(JOB_TYPES.map((type) => type.value));
  const types = (Array.isArray(params.type) ? params.type : params.type ? [params.type] : []).filter((type) =>
    validTypes.has(type),
  );
  const tab = params.tab === "recent" || !skills.length ? "recent" : "best";
  const hideApplied = params.hide === "applied";

  let query = supabase
    .from("jobs")
    .select("id, title, description, requirements, location, type, job_type, salary_range, created_at, company:companies (name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,requirements.ilike.%${q}%`);
  if (types.length) query = query.or(`type.in.(${types.join(",")}),job_type.in.(${types.join(",")})`);

  const [{ data: jobRows }, { data: typeRows }, { data: applications }] = await Promise.all([
    query,
    supabase.from("jobs").select("type, job_type").eq("status", "published"),
    supabase.from("applications").select("job_id").eq("candidate_id", user.id),
  ]);

  const appliedJobIds = new Set((applications ?? []).map((app) => app.job_id as string));
  const counts: Record<string, number> = {};
  for (const row of typeRows ?? []) {
    const type = jobTypeOf(row);
    if (type) counts[type] = (counts[type] ?? 0) + 1;
  }

  const feed = ((jobRows ?? []) as unknown as JobListing[])
    .filter((job) => !hideApplied || !appliedJobIds.has(job.id))
    .map((job) => ({ job, matched: matchSkills(job, skills) }));

  // Best matches: most overlapping skills first, newest breaks ties (the query is already newest-first).
  if (tab === "best") feed.sort((a, b) => b.matched.length - a.matched.length);

  const { firstName, lastName, title } = profile;
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Your profile";
  const avatarUrl = String(meta.avatar_url || meta.picture || "") || null;

  // Drives the "Boost your chances" slide (hidden at 100%).
  const strength = profileStrength(profile);

  function tabHref(next: "best" | "recent") {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    types.forEach((type) => search.append("type", type));
    if (hideApplied) search.set("hide", "applied");
    if (next === "recent") search.set("tab", "recent");
    const qs = search.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  }

  const hidden: Record<string, string | string[]> = {};
  if (types.length) hidden.type = types;
  if (tab === "recent" && skills.length) hidden.tab = "recent";
  if (hideApplied) hidden.hide = "applied";

  const isFiltered = Boolean(q || types.length || hideApplied);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:px-8 lg:py-10">
      <section aria-labelledby="feed-heading" className="min-w-0">
        <div className="mb-8">
          <PromoCarousel strength={strength} />
        </div>

        <h1 id="feed-heading" className="text-[26px] font-semibold tracking-[-0.03em] text-neutral-900">
          {firstName ? `Jobs for you, ${firstName}` : "Jobs for you"}
        </h1>

        <div className="mt-5">
          <JobSearch q={q} hidden={hidden} />
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-b border-neutral-200">
          <nav aria-label="Job feed" className="-mb-px flex gap-6">
            {skills.length ? (
              <FeedTab href={tabHref("best")} active={tab === "best"}>
                Best matches
              </FeedTab>
            ) : null}
            <FeedTab href={tabHref("recent")} active={tab === "recent"}>
              Most recent
            </FeedTab>
          </nav>
          <p className="pb-3 text-[13px] text-neutral-500">
            {feed.length} {feed.length === 1 ? "job" : "jobs"}
            {q ? ` for “${q}”` : ""}
          </p>
        </div>

        {tab === "best" ? (
          <p className="mt-4 text-[13px] text-neutral-500">
            Ranked by how well each job matches the skills on your profile.
          </p>
        ) : null}

        {feed.length ? (
          <div className="mt-2 divide-y divide-neutral-200/80">
            {feed.map(({ job, matched }) => (
              <div key={job.id}>
                <JobRow job={job} hasApplied={appliedJobIds.has(job.id)} matchedSkills={matched} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-2xl bg-neutral-50/70 px-6 pb-14 pt-12 text-center">
            <EmptyJobsArt variant={isFiltered ? "search" : "empty"} />
            <p className="mt-6 text-[17px] font-semibold tracking-[-0.015em] text-neutral-900">
              {isFiltered ? "No jobs match your search" : "No open jobs yet"}
            </p>
            <p className="mt-1.5 max-w-sm text-[14px] leading-6 text-neutral-500">
              {isFiltered ? "Try a broader keyword or fewer filters." : "New remote roles are posted often. Check back soon."}
            </p>
            {isFiltered ? (
              <Link
                href="/dashboard"
                className="mt-5 rounded-full bg-surface px-4 py-2 text-[13px] font-medium text-neutral-800 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
              >
                Clear search
              </Link>
            ) : null}
          </div>
        )}
      </section>

      <aside className="space-y-6 lg:pt-1">
        <div className="rounded-2xl p-5 ring-1 ring-neutral-200/80">
          <div className="flex items-center gap-3">
            <UserAvatar seed={user.email || fullName} imageUrl={avatarUrl} size={48} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-neutral-900">{fullName}</p>
              <p className="truncate text-[13px] text-neutral-500">{title || "Add a professional title"}</p>
            </div>
          </div>

          {skills.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills.slice(0, 8).map((skill) => (
                <span key={skill} className="rounded-full bg-neutral-100 px-2.5 py-1 text-[12px] font-medium text-neutral-700">
                  {skill}
                </span>
              ))}
              {skills.length > 8 ? (
                <span className="px-1 py-1 text-[12px] text-neutral-400">+{skills.length - 8} more</span>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-[13px] leading-5 text-neutral-500">Add skills to your profile to get matched with the right jobs.</p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-4 text-center">
            <Link href="/dashboard/applications" className="rounded-xl px-2 py-2 transition-colors hover:bg-neutral-50">
              <span className="block text-[18px] font-semibold tabular-nums text-neutral-900">{appliedJobIds.size}</span>
              <span className="text-[12px] text-neutral-500">Applications</span>
            </Link>
            <Link href="/dashboard/settings" className="flex flex-col items-center justify-center rounded-xl px-2 py-2 text-[13px] font-medium text-brand transition-colors hover:bg-neutral-50">
              Edit profile
            </Link>
          </div>
        </div>

        <div className="lg:rounded-2xl lg:p-5 lg:ring-1 lg:ring-neutral-200/80">
          <JobFilters counts={counts} />
        </div>
      </aside>
    </div>
  );
}

function FeedTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "border-b-2 pb-3 text-[14px] transition-colors",
        active ? "border-brand font-medium text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900",
      )}
    >
      {children}
    </Link>
  );
}
