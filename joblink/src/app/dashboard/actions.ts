"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { COVER_NOTE_LIMIT } from "@/lib/applications";
import { candidateProfileFromMeta } from "@/lib/profile";
import { ownsResume, resumePath, signResume } from "@/lib/resumes";

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

export async function applyForJob(jobId: string, input: { coverLetter?: string } = {}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in again to apply." };
  }

  // The CV is read from the profile on the server, never trusted from the client,
  // and its object path is snapshotted onto the application so later profile edits
  // don't change what was sent (storage RLS lets the employer open exactly this file).
  const stored = String(user.user_metadata?.resume_url || "");
  const resume_url = ownsResume(stored, user.id) ? resumePath(stored) : null;
  if (!resume_url) {
    return { error: "Add your CV to your profile before applying." };
  }
  const cover_letter = (input.coverLetter ?? "").trim();
  if (cover_letter.length > COVER_NOTE_LIMIT) {
    return { error: `Keep your cover note to ${COVER_NOTE_LIMIT.toLocaleString()} characters or fewer.` };
  }

  const { data: job } = await supabase.from("jobs").select("id").eq("id", jobId).eq("status", "published").maybeSingle();
  if (!job) {
    return { error: "This job is no longer taking applications." };
  }

  const profile = candidateProfileFromMeta(user.user_metadata);
  const application = {
    job_id: jobId,
    candidate_id: user.id,
    status: "pending",
    resume_url,
    cover_letter: cover_letter || null,
  };
  let { error } = await supabase.from("applications").insert({
    ...application,
    candidate_title: profile.title.trim().slice(0, 100) || null,
    candidate_skills: profile.skills.slice(0, 30),
  });
  // Before the apply-flow migration adds the snapshot columns, still accept the application.
  if (error?.code === "PGRST204") {
    ({ error } = await supabase.from("applications").insert(application));
  }

  // Unique violation = already applied; treat as success.
  if (error && error.code !== "23505") {
    console.error("Error applying for job:", error);
    return {
      error: /row-level security/i.test(error.message)
        ? "Applications are blocked by a database permission. Please contact support."
        : "We couldn't send your application. Please try again.",
    };
  }

  revalidatePath("/dashboard", "layout");
  return {};
}

/** Saves a freshly uploaded CV (an object path in the user's own folder) to the profile. */
export async function saveResume(path: string): Promise<{ error?: string; path?: string; viewUrl?: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Please sign in again." };
  }

  const resume_url = ownsResume(path, user.id) ? resumePath(path) : null;
  if (!resume_url) {
    return { error: "That CV upload didn't go through. Please try again." };
  }

  const { error } = await supabase.auth.updateUser({ data: { resume_url } });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  return { path: resume_url, viewUrl: await signResume(supabase, resume_url) };
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
  const resume_url = resumePath(input.resumeUrl) ?? "";

  if (!first_name || !last_name) {
    return { error: "Your first and last name are required." };
  }
  if (input.resumeUrl.trim() && !ownsResume(input.resumeUrl, user.id)) {
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
