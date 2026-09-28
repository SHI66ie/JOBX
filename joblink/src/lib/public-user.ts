import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/utils/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** Turns Postgres / PostgREST errors into something safe to show users. */
export function publicErrorMessage(error: { message?: string; code?: string } | null | undefined, fallback: string) {
  const message = String(error?.message || "");
  const code = String(error?.code || "");

  if (code === "23503" || /foreign key/i.test(message)) {
    return "Your account profile is not in the database yet. Refresh and try again.";
  }
  if (code === "42501" || /row-level security/i.test(message) || /permission denied/i.test(message)) {
    return "You do not have permission to save this company profile. Check Supabase RLS policies on companies.";
  }
  if (code === "23505" || /duplicate key/i.test(message)) {
    return "A company profile already exists for this account.";
  }
  if (/column .* does not exist/i.test(message)) {
    return "The companies table is missing a column. Run joblink/supabase/schema.sql in Supabase.";
  }
  if (/Server Components render/i.test(message)) {
    return fallback;
  }
  return message || fallback;
}

/** Makes sure the public.users row exists (companies.created_by references it). */
export async function ensurePublicUser(
  supabase: ServerClient,
  user: User,
  fields: { first_name?: string; last_name?: string; role?: string },
) {
  const payload = {
    id: user.id,
    email: user.email || null,
    first_name: fields.first_name || user.user_metadata?.first_name || "",
    last_name: fields.last_name || user.user_metadata?.last_name || "",
    role: fields.role || "employer",
  };

  const { error } = await supabase.from("users").upsert(payload, { onConflict: "id" });
  if (!error) return;

  const insertAttempt = await supabase.from("users").insert(payload);
  if (!insertAttempt.error) return;

  await supabase
    .from("users")
    .update({
      first_name: payload.first_name,
      last_name: payload.last_name,
      role: payload.role,
    })
    .eq("id", user.id);
}
