import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceSupabaseClient } from "./server";
import { getSupabasePublicEnv, hasSupabasePublicEnv } from "./config";

export async function createAuthSupabaseClient() {
  if (!hasSupabasePublicEnv()) return null;

  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies; Server Actions can.
        }
      }
    }
  });
}

export async function getAdminUser() {
  const supabase = await createAuthSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const serviceSupabase = createServiceSupabaseClient();
  if (!serviceSupabase) return null;

  const { data, error } = await serviceSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error || data?.role !== "admin") return null;
  return user;
}

export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) throw new Error("Admin access required");
  return user;
}
