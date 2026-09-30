import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MOCK_APPLICATIONS, MOCK_CANDIDATE_EXTRAS, MOCK_COMPANY, MOCK_JOBS, MOCK_USER } from "@/lib/mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/** True when NEXT_PUBLIC_USE_MOCK_DATA=true: employer pages render sample data. */
export const IS_MOCK = USE_MOCK;

export type Company = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  created_by: string;
};

export async function requireEmployerUser() {
  if (USE_MOCK) {
    // Return a minimal supabase stub + mock user so pages don't crash
    const supabase = await createClient().catch(() => null);
    return { supabase: supabase as Awaited<ReturnType<typeof createClient>>, user: MOCK_USER as never };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?role=employer");
  }

  return { supabase, user };
}

export async function requireCompany() {
  if (USE_MOCK) {
    const supabase = await createClient().catch(() => null);
    return {
      supabase: supabase as Awaited<ReturnType<typeof createClient>>,
      user: MOCK_USER as never,
      company: MOCK_COMPANY,
    };
  }

  const { supabase, user } = await requireEmployerUser();

  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, description, website, created_by")
    .eq("created_by", user.id)
    .maybeSingle();

  if (error) {
    console.error("[requireCompany] Supabase error:", error.message);
  }

  if (!company) {
    redirect("/employer/settings");
  }

  return { supabase, user, company: company as Company };
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case "published":
    case "active":
    case "accepted":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200";
    case "interviewing":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200";
    case "reviewed":
    case "reviewing":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200";
    case "closed":
    case "draft":
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
  }
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type JobRow = {
  id: string;
  title: string;
  location: string;
  type: string | null;
  status: string;
  salary_range?: string | null;
  created_at: string;
  company_id?: string | null;
  employer_id?: string | null;
  applications?: { id: string; status?: string; created_at?: string }[];
};

/** Fetch jobs for a company — returns mock data when USE_MOCK is set or on Supabase error */
export async function getJobsForCompany(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
  _selectClause = "id, title, location, type, status, salary_range, created_at, applications(id, status, created_at)"
): Promise<JobRow[]> {
  if (USE_MOCK) {
    return MOCK_JOBS as JobRow[];
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, location, type, status, salary_range, created_at, applications(id, status, created_at)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getJobsForCompany] Supabase error:", error.message);
    return MOCK_JOBS as JobRow[];
  }

  return (data ?? []) as JobRow[];
}

export type CandidateSummary = {
  id?: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio?: string | null;
};

export type CompanyApplication = {
  id: string;
  status: string;
  created_at: string;
  candidate_title?: string | null;
  job: { id: string; title: string } | null;
  candidate: CandidateSummary | null;
};

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export function candidateName(candidate: CandidateSummary | null) {
  return [candidate?.first_name, candidate?.last_name].filter(Boolean).join(" ") || candidate?.email || "Candidate";
}

/** Every application across the company's jobs, newest first, with job + candidate details. */
export async function getCompanyApplications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
  limit?: number,
): Promise<CompanyApplication[]> {
  if (USE_MOCK) {
    const rows = MOCK_APPLICATIONS.map((app) => ({
      id: app.id,
      status: app.status,
      created_at: app.created_at,
      job: { id: app.jobId, title: app.jobTitle },
      candidate: {
        first_name: app.users.full_name.split(" ")[0] ?? null,
        last_name: app.users.full_name.split(" ").slice(1).join(" ") || null,
        email: app.users.email,
        bio: app.users.bio,
      },
    }));
    return limit ? rows.slice(0, limit) : rows;
  }

  const { data: jobs } = await supabase.from("jobs").select("id").eq("company_id", companyId);
  const jobIds = (jobs ?? []).map((job) => job.id);
  if (!jobIds.length) return [];

  let query = supabase
    .from("applications")
    .select("*, job:jobs (id, title), candidate:users (id, first_name, last_name, email, bio)")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("[getCompanyApplications] Supabase error:", error.message);
    return [];
  }

  type Raw = Omit<CompanyApplication, "job" | "candidate"> & {
    job: CompanyApplication["job"] | NonNullable<CompanyApplication["job"]>[];
    candidate: CandidateSummary | CandidateSummary[] | null;
  };
  return ((data ?? []) as unknown as Raw[]).map((row) => ({ ...row, job: firstOf(row.job), candidate: firstOf(row.candidate) }));
}

/** Sample jobs (ids starting "mock-") always render from mock data, so the UI can be previewed without the env flag. */
export function isMockId(id: string) {
  return USE_MOCK || id.startsWith("mock-");
}

/** Mock job (with full listing fields) for the detail, preview and edit pages. */
export function getMockJob(jobId: string) {
  const job = MOCK_JOBS.find((item) => item.id === jobId);
  return job ? { ...job, company: { name: MOCK_COMPANY.name, description: MOCK_COMPANY.description, website: MOCK_COMPANY.website, team_size: "small" } } : null;
}

/** Mock applicants for one job, shaped like the detail page's Supabase query. */
export function getMockJobApplications(jobId: string) {
  return MOCK_APPLICATIONS.filter((app) => app.job_id === jobId).map((app) => {
    const [first_name, ...rest] = app.users.full_name.split(" ");
    return {
      id: app.id,
      status: app.status,
      cover_letter: app.cover_letter,
      resume_url: app.resume_url,
      created_at: app.created_at,
      candidate: { id: app.candidate_id, first_name, last_name: rest.join(" ") || null, email: app.users.email, bio: app.users.bio },
      extras: MOCK_CANDIDATE_EXTRAS[app.candidate_id] ?? null,
    };
  });
}
