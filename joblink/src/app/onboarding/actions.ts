"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isEnterpriseTeam } from "@/lib/employer-options";
import { getUserRoles } from "@/utils/auth";

export async function startOnboardingRole(role: "employer" | "candidate") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in first." };
  }

  const fullName = String(user.user_metadata?.full_name || user.user_metadata?.name || "").trim();
  const [given, ...rest] = fullName.split(" ");
  const first_name = user.user_metadata?.first_name || given || "";
  const last_name = user.user_metadata?.last_name || rest.join(" ") || "";
  const currentRoles = getUserRoles(user);
  const roles = Array.from(new Set([role, ...currentRoles.filter(Boolean)]));

  const { error } = await supabase.auth.updateUser({
    data: {
      first_name,
      last_name,
      role,
      roles,
      onboarded: false,
      ...(role === "employer" ? { employer_onboarded: false } : { candidate_onboarded: false }),
    },
  });

  if (error) {
    return { error: error.message };
  }

  await supabase.from("users").update({ first_name, last_name, role }).eq("id", user.id);
  revalidatePath("/");
  revalidatePath("/onboarding");
  return { ok: true };
}

export async function completeCandidateOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const first_name = String(formData.get("first_name") || "").trim();
  const last_name = String(formData.get("last_name") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const skills = String(formData.get("skills") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const resume_url = String(formData.get("resume_url") || "").trim();

  if (!first_name || !last_name) {
    return { error: "Full name is required." };
  }
  if (!title || !bio || skills.length === 0) {
    return { error: "Add your title, bio, and at least one skill." };
  }

  const roles = Array.from(new Set(["candidate", ...getUserRoles(user)]));
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      first_name,
      last_name,
      title,
      bio,
      skills,
      resume_url: resume_url || user.user_metadata?.resume_url || "",
      role: "candidate",
      roles,
      onboarded: true,
      candidate_onboarded: true,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  try {
    await supabase.from("users").update({ first_name, last_name, role: "candidate", bio }).eq("id", user.id);
  } catch (err) {
    console.warn("Could not update public.users:", err);
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard");
  return { success: true, redirectTo: "/dashboard" };
}

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
  const roles = Array.from(new Set(["employer", ...getUserRoles(user)]));

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      first_name,
      last_name,
      onboarded: true,
      employer_onboarded: true,
      role: "employer",
      roles,
      account_type,
      team_size,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  try {
    await supabase.from("users").update({ first_name, last_name, role: "employer" }).eq("id", user.id);
  } catch (err) {
    console.warn("Could not update public.users:", err);
  }

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
      const fallback = await supabase.from("companies").update({ name: companyName }).eq("id", existing.id);
      if (fallback.error) {
        return { error: fallback.error.message };
      }
    }
  } else {
    const { error } = await supabase.from("companies").insert({
      ...companyFields,
      created_by: user.id,
    });
    if (error) {
      const fallback = await supabase.from("companies").insert({
        name: companyName,
        created_by: user.id,
      });
      if (fallback.error) {
        return { error: fallback.error.message };
      }
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/employer", "layout");
  revalidatePath("/employer/dashboard");
  return { success: true, redirectTo: "/employer/dashboard" };
}
