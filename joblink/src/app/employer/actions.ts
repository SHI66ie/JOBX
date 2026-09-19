"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";

import { getUserRoles } from "@/utils/auth";
import type { User } from "@supabase/supabase-js";

type ActionResult = { error?: string };

function publicErrorMessage(error: { message?: string; code?: string } | null | undefined, fallback: string) {
  const message = String(error?.message || "");
  const code = String(error?.code || "");

  if (code === "23503" || /foreign key/i.test(message)) {
    return "Your account profile is not in the database yet. Refresh and try again.";
  }
  if (code === "42501" || /row-level security/i.test(message) || /permission denied/i.test(message)) {
    return "You do not have permission to save this company profile. Check Supabase RLS policies on companies.";
  }
  if (code === "23505" || /duplicate key/i.test(message)) {
    return "A company profile already exists for this account.";
  }
  if (/column .* does not exist/i.test(message)) {
    return "The companies table is missing a column. Run joblink/supabase/schema.sql in Supabase.";
  }
  if (/Server Components render/i.test(message)) {
    return fallback;
  }
  return message || fallback;
}

async function ensurePublicUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
  fields: { first_name?: string; last_name?: string; role?: string }
) {
  const payload = {
    id: user.id,
    email: user.email || null,
    first_name: fields.first_name || user.user_metadata?.first_name || "",
    last_name: fields.last_name || user.user_metadata?.last_name || "",
    role: fields.role || "employer",
  };

  const { error } = await supabase.from("users").upsert(payload, { onConflict: "id" });
  if (!error) return;

  const insertAttempt = await supabase.from("users").insert(payload);
  if (!insertAttempt.error) return;

  await supabase
    .from("users")
    .update({
      first_name: payload.first_name,
      last_name: payload.last_name,
      role: payload.role,
    })
    .eq("id", user.id);
}

async function getOwnedCompany(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", userId)
    .limit(1)
    .maybeSingle();

  return company;
}

export async function upsertCompanyProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  const first_name = String(formData.get("first_name") || "").trim();
  const last_name = String(formData.get("last_name") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const website = String(formData.get("website") || "").trim();
  const hiring_for = String(formData.get("hiring_for") || "").trim();
  const team_size = String(formData.get("team_size") || "").trim();
  const account_type = String(formData.get("account_type") || "").trim();
  const vat_number = String(formData.get("vat_number") || "").trim();
  const business_registration = String(formData.get("business_registration") || "").trim();
  const requestVerification = formData.get("request_verification") === "true";

  if (!name) {
    return { error: "Company name is required." };
  }

  const currentRoles = getUserRoles(user);
  const roles = Array.from(new Set(["employer", ...currentRoles.filter(Boolean)]));

  await supabase.auth.updateUser({
    data: {
      first_name: first_name || user.user_metadata?.first_name,
      last_name: last_name || user.user_metadata?.last_name,
      role: "employer",
      roles,
      onboarded: true,
      employer_onboarded: true,
      ...(account_type ? { account_type } : {}),
      ...(team_size ? { team_size } : {}),
    },
  });

  await ensurePublicUser(supabase, user, {
    first_name,
    last_name,
    role: "employer",
  });

  const companyFields = {
    name,
    description: description || null,
    website: website || null,
    hiring_for: hiring_for || null,
    industry: hiring_for || null,
    team_size: team_size || null,
    account_type: account_type || null,
    vat_number: vat_number || null,
    business_registration: business_registration || null,
    ...(requestVerification ? { verification_status: "pending" } : {}),
  };

  const fallbackFields = {
    name,
    description: description || null,
    website: website || null,
  };

  let existingCompany = await getOwnedCompany(supabase, user.id);

  const saveCompany = async () => {
    if (existingCompany) {
      const { error } = await supabase.from("companies").update(companyFields).eq("id", existingCompany.id);
      if (!error) return null;
      const fallback = await supabase.from("companies").update(fallbackFields).eq("id", existingCompany.id);
      return fallback.error;
    }

    const { error } = await supabase.from("companies").insert({
      ...companyFields,
      created_by: user.id,
    });
    if (!error) return null;

    if (error.code === "23505" || /duplicate key/i.test(error.message)) {
      existingCompany = await getOwnedCompany(supabase, user.id);
      if (existingCompany) {
        const retry = await supabase.from("companies").update(fallbackFields).eq("id", existingCompany.id);
        return retry.error;
      }
    }

    const fallback = await supabase.from("companies").insert({
      ...fallbackFields,
      created_by: user.id,
    });
    return fallback.error;
  };

  let saveError = await saveCompany();
  if (saveError && (saveError.code === "23503" || /foreign key/i.test(saveError.message))) {
    await ensurePublicUser(supabase, user, { first_name, last_name, role: "employer" });
    saveError = await saveCompany();
  }

  if (saveError) {
    console.error("Company profile save failed:", saveError);
    return {
      error: publicErrorMessage(saveError, "Could not create the company profile. Check the companies table and RLS policies."),
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/employer", "layout");
  revalidatePath("/employer/settings");
  revalidatePath("/employer/dashboard");
  redirect("/employer/dashboard");
}

function jobPayload(formData: FormData, companyId: string, employerId: string) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const requirements = String(formData.get("requirements") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const type = String(formData.get("type") || "full-time").trim();
  const salary_range = String(formData.get("salary_range") || "").trim();
  const status = String(formData.get("status") || "published").trim();

  if (!title || !description || !location) {
    throw new Error("Title, location, and description are required.");
  }

  return {
    company_id: companyId,
    employer_id: employerId,
    title,
    description,
    requirements: requirements || null,
    location,
    type,
    job_type: type,
    salary_range: salary_range || null,
    status,
  };
}

export async function postJob(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const company = await getOwnedCompany(supabase, user.id);
  if (!company) {
    throw new Error("You must create a company profile first.");
  }

  const { error } = await supabase.from("jobs").insert(jobPayload(formData, company.id, user.id));

  if (error) {
    console.error("Error posting job:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/jobs");
  redirect("/employer/dashboard");
}

export async function updateJob(jobId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const company = await getOwnedCompany(supabase, user.id);
  if (!company) {
    throw new Error("You must create a company profile first.");
  }

  const { error } = await supabase
    .from("jobs")
    .update(jobPayload(formData, company.id, user.id))
    .eq("id", jobId)
    .eq("company_id", company.id);

  if (error) {
    console.error("Error updating job:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/jobs");
  revalidatePath(`/employer/jobs/${jobId}`);
  redirect(`/employer/jobs/${jobId}`);
}

export async function setJobStatus(jobId: string, status: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const allowed = ["published", "closed", "draft"];
  if (!allowed.includes(status)) {
    throw new Error("Invalid job status.");
  }

  const company = await getOwnedCompany(supabase, user.id);
  if (!company) {
    throw new Error("You must create a company profile first.");
  }

  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId)
    .eq("company_id", company.id);

  if (error) {
    console.error("Error updating job status:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/jobs");
  revalidatePath(`/employer/jobs/${jobId}`);
}

export async function deleteJob(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const company = await getOwnedCompany(supabase, user.id);
  if (!company) {
    throw new Error("You must create a company profile first.");
  }

  const { error } = await supabase.from("jobs").delete().eq("id", jobId).eq("company_id", company.id);

  if (error) {
    console.error("Error deleting job:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/jobs");
  redirect("/employer/dashboard");
}

export async function updateApplicationStatus(applicationId: string, status: string, jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: application } = await supabase
    .from("applications")
    .select("candidate_id, job:jobs(title)")
    .eq("id", applicationId)
    .single();

  const { error } = await supabase.from("applications").update({ status }).eq("id", applicationId);

  if (error) {
    console.error("Error updating application status:", error);
    throw new Error(error.message);
  }

  if (application) {
    try {
      const job = application.job as { title?: string } | { title?: string }[] | null;
      const jobTitle =
        job && !Array.isArray(job)
          ? job.title
          : Array.isArray(job)
            ? job[0]?.title
            : undefined;

      const statusMessages: Record<string, string> = {
        accepted: `Congratulations! Your application${jobTitle ? ` for ${jobTitle}` : ""} has been accepted.`,
        rejected: `Your application${jobTitle ? ` for ${jobTitle}` : ""} was not selected this time.`,
        interviewing: `You have been invited to interview${jobTitle ? ` for ${jobTitle}` : ""}.`,
        reviewed: `Your application${jobTitle ? ` for ${jobTitle}` : ""} is being reviewed.`,
        pending: `Your application${jobTitle ? ` for ${jobTitle}` : ""} is pending.`,
      };

      await createNotification(
        application.candidate_id,
        "application_status",
        `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        statusMessages[status] || `Your application status has been updated to ${status}.`,
        applicationId
      );
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
    }
  }

  revalidatePath(`/employer/jobs/${jobId}`);
  revalidatePath("/employer/applicants");
  revalidatePath("/employer/dashboard");
  revalidatePath("/dashboard/applications");
}
