"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCompanyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const website = formData.get("website") as string;

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

  revalidatePath("/dashboard/company");
  redirect("/dashboard/company");
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

  revalidatePath("/dashboard/company");
  redirect("/dashboard/company");
}

export async function applyForJob(jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      candidate_id: user.id,
      status: "pending",
    });

  if (error) {
    console.error("Error applying for job:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/seeker");
}

export async function updateApplicationStatus(applicationId: string, status: string, jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // The RLS policy on applications table ensures only the employer who created the job can update it.
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) {
    console.error("Error updating application status:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/company/jobs/${jobId}`);
}
