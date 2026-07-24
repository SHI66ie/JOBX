"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";

export async function upsertCompanyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const website = formData.get("website") as string;

  // Check if company exists
  const { data: existingCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (existingCompany) {
    const { error } = await supabase
      .from("companies")
      .update({
        name,
        description,
        website,
      })
      .eq("id", existingCompany.id);

    if (error) {
      console.error("Error updating company:", error);
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("companies")
      .insert({
        name,
        description,
        website,
        created_by: user.id,
      });

    if (error) {
      console.error("Error creating company:", error);
      throw new Error(error.message);
    }
  }

  revalidatePath("/employer/settings");
  redirect("/employer/dashboard");
}

export async function postJob(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the company ID for this user
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!company) {
    throw new Error("You must create a company profile first.");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const type = formData.get("type") as string;
  const salary_range = formData.get("salary_range") as string;

  const { error } = await supabase
    .from("jobs")
    .insert({
      company_id: company.id,
      title,
      description,
      location,
      type,
      salary_range,
      status: "published", // Default to published for MVP
    });

  if (error) {
    console.error("Error posting job:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employer/dashboard");
  redirect("/employer/dashboard");
}

export async function updateApplicationStatus(applicationId: string, status: string, jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the application details to notify the candidate
  const { data: application } = await supabase
    .from("applications")
    .select("candidate_id, job:jobs(title)")
    .eq("id", applicationId)
    .single();

  // The RLS policy on applications table ensures only the employer who created the job can update it.
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) {
    console.error("Error updating application status:", error);
    throw new Error(error.message);
  }

  // Notify the candidate about the status change
  if (application) {
    try {
      const statusMessages = {
        accepted: "Congratulations! Your application has been accepted.",
        rejected: "Your application has been rejected.",
        interviewing: "You have been selected for an interview.",
        reviewed: "Your application is being reviewed.",
        pending: "Your application status is pending."
      };

      await createNotification(
        application.candidate_id,
        "application_status",
        `Application Status Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        statusMessages[status as keyof typeof statusMessages] || `Your application status has been updated to ${status}.`,
        applicationId
      );
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the whole operation if notification fails
    }
  }

  revalidatePath(`/employer/jobs/${jobId}`);
  revalidatePath("/dashboard/applications");
}
