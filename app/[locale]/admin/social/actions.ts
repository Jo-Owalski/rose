"use server";

import { revalidatePath } from "next/cache";
import { isLocale, type Locale } from "@/lib/i18n";
import { requireAdminUser } from "@/lib/supabase/auth";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { uploadAdminImage } from "@/lib/media-upload";

export type SocialFormState = {
  error?: string;
  saved?: boolean;
};

export type SocialDeleteState = {
  error?: string;
  deleted?: boolean;
};

function formLocale(value: FormDataEntryValue | null): Locale {
  return isLocale(String(value)) ? (String(value) as Locale) : "en";
}

function integer(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(String(value ?? ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

export async function saveSocialPostAction(_state: SocialFormState, formData: FormData): Promise<SocialFormState> {
  const locale = formLocale(formData.get("locale"));

  try {
    await requireAdminUser();
    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Supabase service client is not configured");

    const id = String(formData.get("id") ?? "");
    const titleEn = String(formData.get("titleEn") ?? "").trim();
    const titleFr = String(formData.get("titleFr") ?? "").trim();
    const postUrl = String(formData.get("postUrl") ?? "").trim();
    const uploadedImageUrl = await uploadAdminImage(supabase, formData.get("imageFile"), "social");
    const imageUrl = uploadedImageUrl || String(formData.get("imageUrl") ?? "").trim();
    const channel = String(formData.get("channel") ?? "instagram");

    if (!titleEn || !titleFr || !postUrl || !imageUrl) {
      return {
        error:
          locale === "fr"
            ? "Titre EN/FR, lien de publication et image sont requis."
            : "EN/FR title, post link, and image are required."
      };
    }

    const payload = {
      channel,
      post_url: postUrl,
      image_url: imageUrl,
      title_en: titleEn,
      title_fr: titleFr,
      caption_en: String(formData.get("captionEn") ?? "").trim(),
      caption_fr: String(formData.get("captionFr") ?? "").trim(),
      sort_order: integer(formData.get("sortOrder"), 0),
      is_visible: formData.get("isVisible") === "on",
      updated_at: new Date().toISOString()
    };

    const { error } = id
      ? await supabase.from("social_posts").update(payload).eq("id", id)
      : await supabase.from("social_posts").insert(payload);

    if (error) throw new Error(error.message);

    revalidatePath(`/${locale}/admin/social`);
    revalidatePath(`/${locale}/testimonials`);
    return { saved: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de sauvegarder la publication."
            : "Could not save social post."
    };
  }
}

export async function deleteSocialPostAction(_state: SocialDeleteState, formData: FormData): Promise<SocialDeleteState> {
  const locale = formLocale(formData.get("locale"));

  try {
    await requireAdminUser();
    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Supabase service client is not configured");

    const id = String(formData.get("id") ?? "");
    if (!id) throw new Error("Missing social post id");

    const { error } = await supabase.from("social_posts").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath(`/${locale}/admin/social`);
    revalidatePath(`/${locale}/testimonials`);
    return { deleted: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : locale === "fr"
            ? "Impossible de supprimer la publication."
            : "Could not delete social post."
    };
  }
}
