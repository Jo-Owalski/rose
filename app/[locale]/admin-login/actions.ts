"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { createAuthSupabaseClient, getAdminUser } from "@/lib/supabase/auth";

export type SignInState = {
  error?: string;
};

function formLocale(value: FormDataEntryValue | null): Locale {
  return isLocale(String(value)) ? (String(value) as Locale) : "en";
}

export async function signInAdminAction(_state: SignInState, formData: FormData): Promise<SignInState> {
  const locale = formLocale(formData.get("locale"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createAuthSupabaseClient();

  if (!supabase) {
    return { error: locale === "fr" ? "Supabase n'est pas configure." : "Supabase is not configured." };
  }

  if (!email || !password) {
    return { error: locale === "fr" ? "Email et mot de passe requis." : "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error:
        locale === "fr"
          ? "Connexion impossible. Verifiez l'email et le mot de passe."
          : "Could not sign in. Check the email and password."
    };
  }

  const adminUser = await getAdminUser();
  if (!adminUser) {
    await supabase.auth.signOut();
    return {
      error:
        locale === "fr"
          ? "Ce compte n'a pas le role admin."
          : "This account does not have the admin role."
    };
  }

  redirect(`/${locale}/admin`);
}
