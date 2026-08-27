"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isEnterpriseTeam } from "@/lib/employer-options";

export async function completeEmployerOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const first_name = String(formData.get("first_name") || "").trim();
  const last_name = String(formData.get("last_name") || "").trim();
  const account_type = String(formData.get("account_type") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const hiring_for = String(formData.get("hiring_for") || "").trim();
  const team_size = String(formData.get("team_size") || "").trim();
  const vat_number = String(formData.get("vat_number") || "").trim();
  const business_registration = String(formData.get("business_registration") || "").trim();
  const requestVerification = formData.get("request_verification") === "true";

  if (!first_name || !last_name) {
    return { error: "Full name is required." };
  }
  if (!hiring_for || !team_size || !account_type) {
    return { error: "Tell us what you hire for and your team size." };
  }

  const enterprise = isEnterpriseTeam(team_size);
  if (enterprise && !name) {
    return { error: "Company name is required for enterprise accounts." };
  }
  if (enterprise && (!vat_number || !business_registration)) {
    return { error: "Enterprise accounts need a VAT / tax ID and business registration number." };
  }

  const companyName = name || `${first_name} ${last_name}`;
  const verification_status = requestVerification ? "pending" : "unverified";

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      first_name,
      last_name,
      onboarded: true,
      role: "employer",
      roles: Array.from(new Set(["employer", ...((user.user_metadata?.roles as string[]) || [])])),
      account_type,
      team_size,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  await supabase
    .from("users")
    .update({ first_name, last_name, role: "employer" })
    .eq("id", user.id);

  const companyFields = {
    name: companyName,
    hiring_for,
    industry: hiring_for,
    team_size,
    account_type,
    vat_number: vat_number || null,
    business_registration: business_registration || null,
    verification_status,
  };

  const { data: existing } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("companies").update(companyFields).eq("id", existing.id);
    if (error) {
      return { error: error.message };
    }
  } else {
    const { error } = await supabase.from("companies").insert({
      ...companyFields,
      created_by: user.id,
    });
    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/employer/dashboard");
  redirect("/employer/dashboard");
}
