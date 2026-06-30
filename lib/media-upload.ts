import type { SupabaseClient } from "@supabase/supabase-js";

const mediaBucket = "rose-media";
const maxUploadBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName.replace(/[^a-z0-9]/g, "");
  return file.type.split("/").pop() ?? "jpg";
}

export async function uploadAdminImage(supabase: SupabaseClient, file: FormDataEntryValue | null, folder: string) {
  if (!(file instanceof File) || file.size === 0) return "";

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, or GIF images are allowed.");
  }

  if (file.size > maxUploadBytes) {
    throw new Error("Image is too large. Maximum size is 5 MB.");
  }

  const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${fileExtension(file)}`;
  const { error } = await supabase.storage.from(mediaBucket).upload(path, await file.arrayBuffer(), {
    contentType: file.type,
    upsert: false
  });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl }
  } = supabase.storage.from(mediaBucket).getPublicUrl(path);

  return publicUrl;
}
