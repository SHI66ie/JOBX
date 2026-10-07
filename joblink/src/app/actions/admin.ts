"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// ---------------------------------------------------------------------------
// Auth guard — only admins may call these actions
// ---------------------------------------------------------------------------
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthenticated");

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (data?.role !== "admin") throw new Error("Forbidden");

  return await createAdminClient();
}

// ---------------------------------------------------------------------------
// Companies — verify / unverify
// ---------------------------------------------------------------------------
export async function actionSetCompanyVerification(
  companyId: string,
  status: "verified" | "unverified" | "suspended"
) {
  if (!companyId) throw new Error("Missing companyId");

  const adminClient = await requireAdmin();

  const { error } = await adminClient
    .from("companies")
    .update({ verification_status: status })
    .eq("id", companyId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/companies");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Jobs — set status (published / draft / closed)
// ---------------------------------------------------------------------------
export async function actionSetJobStatus(
  jobId: string,
  status: "published" | "draft" | "closed"
) {
  if (!jobId) throw new Error("Missing jobId");

  const adminClient = await requireAdmin();

  const { error } = await adminClient
    .from("jobs")
    .update({ status })
    .eq("id", jobId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/jobs");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Users — set role (suspend = set role to 'suspended', or restore to previous)
// ---------------------------------------------------------------------------
export async function actionSetUserRole(
  userId: string,
  role: "candidate" | "employer" | "admin" | "suspended"
) {
  if (!userId) throw new Error("Missing userId");

  const adminClient = await requireAdmin();

  const { error } = await adminClient
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
