import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "./server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Creates an elevated Supabase client for admin dashboard operations.
 * If SUPABASE_SERVICE_ROLE_KEY is configured in env, it uses the service role key
 * to bypass RLS for aggregate platform statistics and user administration.
 * Otherwise, it falls back to the user's server session client.
 */
export async function createAdminClient() {
  if (supabaseUrl && serviceRoleKey) {
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return await createServerClient();
}
