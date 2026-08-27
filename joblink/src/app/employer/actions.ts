"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";

async function getOwnedCompany(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", userId)
    .maybeSingle();

  return company;
}

export async function upsertCompanyProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
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
    throw new Error("Company name is required.");
  }

  if (first_name || last_name) {
    await supabase.auth.updateUser({
      data: {
        first_name: first_name || user.user_metadata?.first_name,
        last_name: last_name || user.user_metadata?.last_name,
      },
    });
    await supabase
      .from("users")
      .update({
        first_name: first_name || undefined,
        last_name: last_name || undefined,
      })
      .eq("id", user.id);
  }

  const companyFields = {
    name,
    description,
    website,
    hiring_for: hiring_for || null,
    industry: hiring_for || null,
    team_size: team_size || null,
    account_type: account_type || null,
    vat_number: vat_number || null,
    business_registration: business_registration || null,
    ...(requestVerification ? { verification_status: "pending" } : {}),
  };

  const existingCompany = await getOwnedCompany(supabase, user.id);

  if (existingCompany) {
    const { error } = await supabase
      .from("companies")
      .update(companyFields)
      .eq("id", existingCompany.id);

    if (error) {
      console.error("Error updating company:", error);
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("companies").insert({
      ...companyFields,
      created_by: user.id,
    });

    if (error) {
      console.error("Error creating company:", error);
      throw new Error(error.message);
    }
  }

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
      const jobTitle = Array.isArray(job) ? job[0]?.title : job?.title;

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
