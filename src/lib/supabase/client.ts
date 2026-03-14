"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/types/database";
import { getSupabaseClientEnv } from "@/lib/env";

export function createClient() {
  const { url, anonKey } = getSupabaseClientEnv();

  return createBrowserClient<Database>(url, anonKey);
}
