import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { MOCK_COMPANY, MOCK_JOBS, MOCK_USER } from "@/lib/mock-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

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
