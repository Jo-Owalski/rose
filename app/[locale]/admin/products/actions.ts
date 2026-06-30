"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/supabase/auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/lib/i18n";
import { uploadAdminImage } from "@/lib/media-upload";

export type ProductFormState = {
  error?: string;
  saved?: boolean;
};

export type ProductArchiveState = {
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

function cents(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw.replace(",", "."));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function integer(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(String(value ?? ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

export async function saveProductAction(_state: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const locale = formLocale(formData.get("locale"));

  try {
    await requireAdminUser();
    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Supabase service client is not configured");

    const id = String(formData.get("id") ?? "");
    const nameEn = String(formData.get("nameEn") ?? "").trim();
    const nameFr = String(formData.get("nameFr") ?? "").trim();
    const slug = slugify(String(formData.get("slug") ?? "") || nameEn);
    const availability = String(formData.get("availability") ?? "available");
    const uploadedImageUrl = await uploadAdminImage(supabase, formData.get("imageFile"), "products");
    const imageUrl = uploadedImageUrl || String(formData.get("imageUrl") ?? "").trim();

    if (!nameEn || !nameFr || !slug) {
      return { error: locale === "fr" ? "Nom EN, nom FR et slug sont requis." : "EN name, FR name, and slug are required." };
    }

    const productPayload = {
      slug,
      category_id: String(formData.get("categoryId") ?? "") || null,
      name_en: nameEn,
      name_fr: nameFr,
      description_en: String(formData.get("descriptionEn") ?? "").trim(),
      description_fr: String(formData.get("descriptionFr") ?? "").trim(),
      product_type: String(formData.get("productType") ?? "individual"),
      price_cents: cents(formData.get("price")),
      starting_price_cents: cents(formData.get("startingPrice")),
      is_available: availability !== "sold-out",
      is_featured: formData.get("isFeatured") === "on",
      is_seasonal: availability === "seasonal",
      is_hidden: availability === "hidden",
      preparation_lead_time_hours: integer(formData.get("leadTimeHours"), 24),
      sort_order: integer(formData.get("sortOrder"), 0),
      updated_at: new Date().toISOString()
    };

    const query = id
      ? supabase.from("products").update(productPayload).eq("id", id).select("id").single()
      : supabase.from("products").insert(productPayload).select("id").single();

    const { data: product, error } = await query;
    if (error || !product) throw new Error(error?.message ?? "Product could not be saved");

    await supabase.from("product_images").delete().eq("product_id", product.id).eq("is_primary", true);
    if (imageUrl) {
      const { error: imageError } = await supabase.from("product_images").insert({
        product_id: product.id,
        image_url: imageUrl,
        alt_text_en: nameEn,
        alt_text_fr: nameFr,
        is_primary: true,
        sort_order: 0
      });
      if (imageError) throw new Error(imageError.message);
    }

    revalidatePath(`/${locale}/admin/products`);
    revalidatePath(`/${locale}/menu`);
    return { saved: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de sauvegarder le produit."
            : "Could not save product."
    };
  }
}

export async function archiveProductAction(_state: ProductArchiveState, formData: FormData): Promise<ProductArchiveState> {
  const locale = formLocale(formData.get("locale"));

  try {
    await requireAdminUser();
    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Supabase service client is not configured");

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing product id");

    const { error } = await supabase
      .from("products")
      .update({ is_hidden: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath(`/${locale}/admin/products`);
    revalidatePath(`/${locale}/menu`);
    return { archived: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de masquer le produit."
            : "Could not hide product."
    };
  }
}
