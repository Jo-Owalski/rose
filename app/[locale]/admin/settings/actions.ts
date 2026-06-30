"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/supabase/auth";
import { updateBusinessSettings, type BusinessSettings } from "@/lib/business-settings";
import { isLocale, type Locale } from "@/lib/i18n";

export type SettingsState = {
  error?: string;
  saved?: boolean;
};

function formLocale(value: FormDataEntryValue | null): Locale {
  return isLocale(String(value)) ? (String(value) as Locale) : "en";
}

export async function saveSettingsAction(_state: SettingsState, formData: FormData): Promise<SettingsState> {
  const locale = formLocale(formData.get("locale"));

  try {
    await requireAdminUser();

    const settings: BusinessSettings = {
      whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
      orderEmail: String(formData.get("orderEmail") ?? ""),
      pickupInstructions: String(formData.get("pickupInstructions") ?? "")
    };

    await updateBusinessSettings(settings);
    revalidatePath(`/${locale}/admin/settings`);
    revalidatePath(`/${locale}/checkout`);
    return { saved: true };
  } catch {
    return {
      error:
        locale === "fr"
          ? "Impossible de sauvegarder les parametres. Verifiez la table Supabase business_settings."
          : "Could not save settings. Check the Supabase business_settings table."
    };
  }
}
