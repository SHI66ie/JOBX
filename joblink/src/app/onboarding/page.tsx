import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserRoles, hasCompletedOnboarding } from "@/utils/auth";
import OnboardingForm from "./onboarding-form";
import EmployerOnboardingForm from "./employer-onboarding-form";

function nameFromUser(user: {
  user_metadata?: Record<string, string | undefined>;
}) {
  const meta = user.user_metadata || {};
  if (meta.first_name || meta.last_name) {
    return { firstName: meta.first_name || "", lastName: meta.last_name || "" };
  }
  const full = String(meta.full_name || meta.name || "").trim();
  const [firstName, ...rest] = full.split(" ");
  return { firstName: firstName || "", lastName: rest.join(" ") };
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }> | { role?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await Promise.resolve(searchParams || {});
  const roles = getUserRoles(user);
  const isEmployer = params.role === "employer" || (params.role !== "candidate" && roles.includes("employer") && !roles.includes("candidate"));

  // Finished accounts see the success screen rather than a server redirect.
  // Completing onboarding sets auth cookies, which re-renders this page; a
  // redirect here would yank people off the success screen.
  const isComplete = hasCompletedOnboarding(user, isEmployer ? "employer" : "candidate");

  const names = nameFromUser(user);
  const initialData = {
    firstName: names.firstName,
    lastName: names.lastName,
    email: user.email || "",
    title: String(user.user_metadata?.title || ""),
    bio: String(user.user_metadata?.bio || ""),
    skills: Array.isArray(user.user_metadata?.skills)
      ? user.user_metadata.skills.join(", ")
      : String(user.user_metadata?.skills || ""),
  };

  return isEmployer ? (
    <EmployerOnboardingForm initialData={initialData} isComplete={isComplete} />
  ) : (
    <OnboardingForm initialData={initialData} isComplete={isComplete} />
  );
}
