import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function EmployerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/employer/dashboard");
  }

  redirect("/signup?role=employer");
}
