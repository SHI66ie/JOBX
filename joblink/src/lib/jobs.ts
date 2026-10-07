import { richTextExcerpt } from "@/lib/rich-text";

export const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
] as const;

export type JobType = (typeof JOB_TYPES)[number]["value"];

export type JobListing = {
  id: string;
  title: string;
  description: string | null;
  requirements?: string | null;
  location: string | null;
  type: string | null;
  job_type: string | null;
  salary_range: string | null;
  created_at: string;
  company: { name: string } | null;
};

/** The job summary shown at the top of the apply sheet. Plain data, so server pages can build it. */
export type ApplyJob = { id: string; title: string; company: string; meta: string };

export function applyJob(job: Pick<JobListing, "id" | "title" | "type" | "job_type" | "salary_range"> & { company: { name: string | null } | null }): ApplyJob {
  return {
    id: job.id,
    title: job.title,
    company: job.company?.name ?? "",
    meta: [jobTypeLabel(jobTypeOf(job)), "Remote", job.salary_range].filter(Boolean).join(" · "),
  };
}

export function jobTypeOf(job: Pick<JobListing, "type" | "job_type">) {
  return job.type || job.job_type || null;
}

export function jobTypeLabel(value: string | null) {
  if (!value) return null;
  return JOB_TYPES.find((type) => type.value === value)?.label ?? value.replace(/-/g, " ");
}

export function isRemote(location: string | null) {
  return Boolean(location && /remote/i.test(location));
}

export function postedAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function isNew(iso: string) {
  return Date.now() - new Date(iso).getTime() < 3 * 86_400_000;
}

const MONOGRAM_TONES = [
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-indigo-50 text-indigo-700",
];

/** Stable soft colour + initials for a company without a logo. */
export function companyMonogram(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?";
  return { initials, tone: MONOGRAM_TONES[hash % MONOGRAM_TONES.length] };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The candidate's skills that appear in a job's title, description or requirements. */
export function matchSkills(
  job: Pick<JobListing, "title" | "description" | "requirements">,
  skills: string[],
) {
  const text = `${job.title} ${richTextExcerpt(job.description ?? "")} ${job.requirements ?? ""}`;
  return skills.filter((skill) => {
    const term = skill.trim();
    if (term.length < 2) return false;
    // Word-ish boundaries so "Go" doesn't match "good".
    return new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(term)}($|[^a-z0-9+#])`, "i").test(text);
  });
}

/** Strip characters that would break a PostgREST `or()` / `ilike` filter. */
export function sanitizeSearch(value: string) {
  return value.replace(/[%,()*\\]/g, " ").trim().slice(0, 80);
}

/** Listing status as employers see it. */
export function jobStatusMeta(status: string | null | undefined) {
  switch (status) {
    case "published":
    case "active":
      return { value: "open" as const, label: "Open", className: "bg-emerald-50 text-emerald-700" };
    case "draft":
      return { value: "draft" as const, label: "Draft", className: "bg-neutral-100 text-neutral-600" };
    default:
      return { value: "closed" as const, label: "Closed", className: "bg-neutral-100 text-neutral-500" };
  }
}

type SupabaseLike = Awaited<ReturnType<typeof import("@/utils/supabase/server").createClient>>;

/** Loads a job with its company for the listing view. Falls back if newer company columns are missing. */
export async function getJobListing(supabase: SupabaseLike, jobId: string, filter: { companyId?: string; publishedOnly?: boolean } = {}) {
  const baseCols = "id, title, description, requirements, type, job_type, salary_range, status, created_at, company_id";
  const attempts = [`${baseCols}, company:companies (name, description, website, team_size)`, `${baseCols}, company:companies (name, description, website)`];

  for (const select of attempts) {
    let query = supabase.from("jobs").select(select).eq("id", jobId);
    if (filter.companyId) query = query.eq("company_id", filter.companyId);
    if (filter.publishedOnly) query = query.eq("status", "published");
    const { data, error } = await query.maybeSingle();
    if (!error) {
      if (!data) return null;
      const row = data as unknown as { company: unknown } & Record<string, unknown>;
      const company = Array.isArray(row.company) ? (row.company[0] ?? null) : (row.company ?? null);
      return { ...row, company } as {
        id: string;
        title: string;
        description: string | null;
        requirements: string | null;
        type: string | null;
        job_type: string | null;
        salary_range: string | null;
        status: string;
        created_at: string;
        company: { name: string | null; description?: string | null; website?: string | null; team_size?: string | null } | null;
      };
    }
  }
  return null;
}
