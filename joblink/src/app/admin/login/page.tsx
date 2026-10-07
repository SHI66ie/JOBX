import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminLoginForm from "./AdminLoginForm";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false }, // keep out of Google
};

export default async function AdminLoginPage() {
  // If already logged in as admin, skip the login page entirely
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      redirect("/admin");
    }
  }

  return <AdminLoginForm />;
}
