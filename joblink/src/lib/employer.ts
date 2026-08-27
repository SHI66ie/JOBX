import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type Company = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  created_by: string;
};

export async function requireEmployerUser() {
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
  const { supabase, user } = await requireEmployerUser();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, description, website, created_by")
    .eq("created_by", user.id)
    .maybeSingle();

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
