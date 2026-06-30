import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv, getSupabaseServiceEnv, hasSupabasePublicEnv, hasSupabaseServiceEnv } from "./config";

export function createPublicSupabaseClient() {
  if (!hasSupabasePublicEnv()) return null;
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createServiceSupabaseClient() {
  if (!hasSupabaseServiceEnv()) return null;
  const { url, serviceRoleKey } = getSupabaseServiceEnv();
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
