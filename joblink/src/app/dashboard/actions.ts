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

  revalidatePath("/employer/settings");
  redirect("/employer/settings");
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
      employer_id: user.id,
      title,
      description,
      location,
      type,
      job_type: type,
      salary_range,
      status: "published",
    });

  if (error) {
    console.error("Error posting job:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/employer/dashboard");
  redirect("/employer/jobs");
}

export async function applyForJob(jobId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again to apply." };
  }

  const { error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      candidate_id: user.id,
      status: "pending",
    });

  // Unique violation = already applied; treat as success.
  if (error && error.code !== "23505") {
    console.error("Error applying for job:", error);
    return {
      error: /row-level security/i.test(error.message)
        ? "Applications are blocked by a database permission. Please contact support."
        : "We couldn't send your application. Please try again.",
    };
  }

  revalidatePath("/dashboard/applications");
  return {};
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

  revalidatePath(`/employer/jobs/${jobId}`);
  revalidatePath("/dashboard/applications");
}

export async function updateCandidateProfile(input: {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  skills: string[];
  resumeUrl: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  const first_name = input.firstName.trim().slice(0, 60);
  const last_name = input.lastName.trim().slice(0, 60);
  const title = input.title.trim().slice(0, 100);
  const bio = input.bio.trim().slice(0, 600);
  const skills = Array.from(new Set(input.skills.map((skill) => skill.trim()).filter(Boolean))).slice(0, 30);
  const resume_url = input.resumeUrl.trim();

  if (!first_name || !last_name) {
    return { error: "Your first and last name are required." };
  }
  if (resume_url && !/^https:\/\//.test(resume_url)) {
    return { error: "That CV link doesn't look right. Try uploading it again." };
  }

  const { error } = await supabase.auth.updateUser({
    data: { first_name, last_name, title, bio, skills, resume_url },
  });
  if (error) {
    return { error: error.message };
  }

  // Keep the public profile row (what employers see) in sync; not fatal if it fails.
  const { error: profileError } = await supabase
    .from("users")
    .update({ first_name, last_name, bio })
    .eq("id", user.id);
  if (profileError) console.warn("Could not sync public.users profile:", profileError.message);

  revalidatePath("/dashboard", "layout");
  return {};
}
