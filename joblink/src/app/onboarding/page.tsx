import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to landing
  if (!user) {
    redirect("/");
  }

  // Pass user details to the Client component form
  const initialData = {
    firstName: user.user_metadata?.first_name || "",
    lastName: user.user_metadata?.last_name || "",
    email: user.email || "",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-white">
          Complete your profile
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Let's get you set up to apply for jobs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-zinc-200 dark:border-zinc-800">
          <OnboardingForm initialData={initialData} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
