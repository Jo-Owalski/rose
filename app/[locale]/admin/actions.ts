"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { createAuthSupabaseClient } from "@/lib/supabase/auth";

function formLocale(value: FormDataEntryValue | null): Locale {
  return isLocale(String(value)) ? (String(value) as Locale) : "en";
}

export async function signOutAdminAction(formData: FormData) {
  const locale = formLocale(formData.get("locale"));
  const supabase = await createAuthSupabaseClient();
  await supabase?.auth.signOut();
  redirect(`/${locale}/admin-login`);
}
