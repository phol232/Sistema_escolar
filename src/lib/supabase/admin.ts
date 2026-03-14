import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types/database";
import { getSupabaseClientEnv, getSupabaseServiceRoleKey } from "@/lib/env";

export function createAdminClient() {
  const { url } = getSupabaseClientEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
