"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/supabase/auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/lib/i18n";
import { uploadAdminImage } from "@/lib/media-upload";

export type CategoryFormState = {
  error?: string;
  saved?: boolean;
};

export type CategoryArchiveState = {
  error?: string;
  archived?: boolean;
};

function formLocale(value: FormDataEntryValue | null): Locale {
  return isLocale(String(value)) ? (String(value) as Locale) : "en";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function integer(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(String(value ?? ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

export async function saveCategoryAction(_state: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const locale = formLocale(formData.get("locale"));

  try {
    await requireAdminUser();
    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Supabase service client is not configured");

    const id = String(formData.get("id") ?? "");
    const nameEn = String(formData.get("nameEn") ?? "").trim();
    const nameFr = String(formData.get("nameFr") ?? "").trim();
    const slug = slugify(String(formData.get("slug") ?? "") || nameEn);
    const uploadedImageUrl = await uploadAdminImage(supabase, formData.get("imageFile"), "categories");
    const imageUrl = uploadedImageUrl || String(formData.get("imageUrl") ?? "").trim();

    if (!nameEn || !nameFr || !slug) {
      return { error: locale === "fr" ? "Nom EN, nom FR et slug sont requis." : "EN name, FR name, and slug are required." };
    }

    const payload = {
      slug,
      name_en: nameEn,
      name_fr: nameFr,
      description_en: String(formData.get("descriptionEn") ?? "").trim(),
      description_fr: String(formData.get("descriptionFr") ?? "").trim(),
      image_url: imageUrl || null,
      sort_order: integer(formData.get("sortOrder"), 0),
      is_active: formData.get("isActive") === "on",
      updated_at: new Date().toISOString()
    };

    const { error } = id
      ? await supabase.from("categories").update(payload).eq("id", id)
      : await supabase.from("categories").insert(payload);

    if (error) throw new Error(error.message);

    revalidatePath(`/${locale}/admin/categories`);
    revalidatePath(`/${locale}/menu`);
    return { saved: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de sauvegarder la categorie."
            : "Could not save category."
    };
  }
}

export async function archiveCategoryAction(_state: CategoryArchiveState, formData: FormData): Promise<CategoryArchiveState> {
  const locale = formLocale(formData.get("locale"));

  try {
    await requireAdminUser();
    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Supabase service client is not configured");

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing category id");

    const { error } = await supabase
      .from("categories")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath(`/${locale}/admin/categories`);
    revalidatePath(`/${locale}/menu`);
    return { archived: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de desactiver la categorie."
            : "Could not deactivate category."
    };
  }
}
