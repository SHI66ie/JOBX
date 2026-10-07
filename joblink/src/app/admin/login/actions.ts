"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function adminLogin(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    redirect("/admin/login?message=Email+and+password+are+required");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/admin/login?message=${encodeURIComponent(error.message)}`);
  }

  // Check admin role before letting them in
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    // Sign them out immediately — they logged in but aren't admin
    await supabase.auth.signOut();
    redirect(
      "/admin/login?message=Access+denied.+This+area+is+for+admins+only."
    );
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}
