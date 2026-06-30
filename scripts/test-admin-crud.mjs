import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function readLocalEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line
            .slice(index + 1)
            .trim()
            .replace(/^['"]|['"]$/g, "");
          return [key, value];
        })
    );
  } catch {
    return {};
  }
}

const env = { ...readLocalEnv(), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Missing Supabase URL, anon key, or service role key in .env.local");
}

const publicSupabase = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const bucket = "rose-media";
const runId = `e2e-${Date.now()}`;
const categorySlug = `e2e-rose-category-${runId}`;
const productSlug = `e2e-rose-product-${runId}`;
const sourcePostId = `e2e-rose-social-${runId}`;
const imageBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64"
);

const cleanup = {
  storagePaths: [],
  productId: "",
  categoryId: "",
  socialId: ""
};

async function ensureBucket() {
  const existing = await serviceSupabase.storage.getBucket(bucket);
  if (!existing.error) return;

  const { error } = await serviceSupabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
  });

  if (error) throw new Error(`Could not create ${bucket} bucket: ${error.message}`);
}

async function uploadImage(folder) {
  const path = `${folder}/${runId}.png`;
  const { error } = await serviceSupabase.storage.from(bucket).upload(path, imageBytes, {
    contentType: "image/png",
    upsert: false
  });

  if (error) throw new Error(`Could not upload ${folder} image: ${error.message}`);
  cleanup.storagePaths.push(path);

  const {
    data: { publicUrl }
  } = serviceSupabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

async function cleanupCreatedData() {
  const tasks = [];
  if (cleanup.socialId) tasks.push(serviceSupabase.from("social_posts").delete().eq("id", cleanup.socialId));
  if (cleanup.productId) tasks.push(serviceSupabase.from("products").delete().eq("id", cleanup.productId));
  if (cleanup.categoryId) tasks.push(serviceSupabase.from("categories").delete().eq("id", cleanup.categoryId));
  if (cleanup.storagePaths.length) tasks.push(serviceSupabase.storage.from(bucket).remove(cleanup.storagePaths));
  await Promise.allSettled(tasks);
}

try {
  await ensureBucket();

  const categoryImageUrl = await uploadImage("categories");
  const productImageUrl = await uploadImage("products");
  const socialImageUrl = await uploadImage("social");

  const { data: category, error: categoryError } = await serviceSupabase
    .from("categories")
    .insert({
      slug: categorySlug,
      name_en: "E2E Rose Test Category",
      name_fr: "Categorie test Rose E2E",
      description_en: "Temporary category created by admin CRUD test.",
      description_fr: "Categorie temporaire creee par le test CRUD admin.",
      image_url: categoryImageUrl,
      sort_order: 9999,
      is_active: true
    })
    .select("id")
    .single();

  if (categoryError || !category) throw new Error(categoryError?.message ?? "Category insert failed");
  cleanup.categoryId = category.id;
  console.log("Category create OK.");

  const { data: product, error: productError } = await serviceSupabase
    .from("products")
    .insert({
      category_id: category.id,
      slug: productSlug,
      name_en: "E2E Rose Test Product",
      name_fr: "Produit test Rose E2E",
      description_en: "Temporary product created by admin CRUD test.",
      description_fr: "Produit temporaire cree par le test CRUD admin.",
      product_type: "individual",
      price_cents: 1234,
      currency: "CAD",
      is_available: true,
      is_featured: false,
      is_seasonal: false,
      is_hidden: false,
      preparation_lead_time_hours: 24,
      sort_order: 9999
    })
    .select("id")
    .single();

  if (productError || !product) throw new Error(productError?.message ?? "Product insert failed");
  cleanup.productId = product.id;

  const { error: imageError } = await serviceSupabase.from("product_images").insert({
    product_id: product.id,
    image_url: productImageUrl,
    alt_text_en: "E2E Rose Test Product",
    alt_text_fr: "Produit test Rose E2E",
    is_primary: true,
    sort_order: 0
  });

  if (imageError) throw new Error(imageError.message);
  console.log("Product create + image OK.");

  const { data: social, error: socialError } = await serviceSupabase
    .from("social_posts")
    .insert({
      channel: "instagram",
      post_url: "https://www.instagram.com/",
      image_url: socialImageUrl,
      title_en: "E2E Rose Test Social",
      title_fr: "Publication test Rose E2E",
      caption_en: "Temporary social post created by admin CRUD test.",
      caption_fr: "Publication temporaire creee par le test CRUD admin.",
      sort_order: 9999,
      is_visible: true,
      source_post_id: sourcePostId
    })
    .select("id")
    .single();

  if (socialError || !social) throw new Error(socialError?.message ?? "Social insert failed");
  cleanup.socialId = social.id;
  console.log("Social create + image OK.");

  const [publicCategory, publicProduct, publicSocial] = await Promise.all([
    publicSupabase.from("categories").select("id, slug").eq("slug", categorySlug).eq("is_active", true).maybeSingle(),
    publicSupabase.from("products").select("id, slug").eq("slug", productSlug).eq("is_hidden", false).maybeSingle(),
    publicSupabase.from("social_posts").select("id, source_post_id").eq("source_post_id", sourcePostId).eq("is_visible", true).maybeSingle()
  ]);

  if (publicCategory.error || !publicCategory.data) throw new Error(publicCategory.error?.message ?? "Public category not visible");
  if (publicProduct.error || !publicProduct.data) throw new Error(publicProduct.error?.message ?? "Public product not visible");
  if (publicSocial.error || !publicSocial.data) throw new Error(publicSocial.error?.message ?? "Public social post not visible");
  console.log("Public visibility OK.");

  const { error: hideError } = await serviceSupabase.from("products").update({ is_hidden: true }).eq("id", product.id);
  if (hideError) throw new Error(hideError.message);

  const hiddenCheck = await publicSupabase.from("products").select("id").eq("slug", productSlug).eq("is_hidden", false).maybeSingle();
  if (hiddenCheck.error || hiddenCheck.data) throw new Error(hiddenCheck.error?.message ?? "Hidden product is still public");
  console.log("Product hide check OK.");
} finally {
  await cleanupCreatedData();
  console.log("Cleanup complete.");
}
