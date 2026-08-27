import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserRoles } from "@/utils/auth";
import OnboardingForm from "./onboarding-form";
import EmployerOnboardingForm from "./employer-onboarding-form";
import { Logo } from "@/components/brand/logo";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const roles = getUserRoles(user);
  const isEmployer = roles.includes("employer");

  const initialData = {
    firstName: user.user_metadata?.first_name || "",
    lastName: user.user_metadata?.last_name || "",
    email: user.email || "",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6 text-[#01224F] dark:text-white">
          <Logo variant="lockup" tone="current" className="h-10" markClassName="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          {isEmployer ? "Set up your hiring profile" : "Complete your profile"}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isEmployer
            ? "Tell us who you are hiring for so we can tailor JOMP to your team."
            : "Let's get you set up to apply for jobs."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-zinc-200 dark:border-zinc-800">
          {isEmployer ? (
            <EmployerOnboardingForm initialData={initialData} />
          ) : (
            <OnboardingForm initialData={initialData} userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}
