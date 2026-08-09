import {
  categories as localCategories,
  products as localProducts,
  type Category,
  type Product,
  type ProductType
} from "./catalog";
import { createPublicSupabaseClient } from "./supabase/server";

type ProductRow = {
  id: string;
  slug: string;
  category_id: string | null;
  name_en: string;
  name_fr: string;
  description_en: string | null;
  description_fr: string | null;
  product_type: ProductType;
  price_cents: number | null;
  starting_price_cents: number | null;
  is_available: boolean | null;
  is_featured: boolean | null;
  is_seasonal: boolean | null;
  is_hidden: boolean | null;
  preparation_lead_time_hours: number | null;
  sort_order: number | null;
  categories?: { slug: string } | Array<{ slug: string }> | null;
  product_images?: Array<{
    image_url: string;
    is_primary: boolean | null;
    sort_order: number | null;
  }>;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_en: string;
  name_fr: string;
  description_en: string | null;
  description_fr: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: { en: row.name_en, fr: row.name_fr },
    description: {
      en: row.description_en ?? "",
      fr: row.description_fr ?? ""
    },
    imageUrl: row.image_url ?? undefined,
    sortOrder: row.sort_order ?? 0
  };
}

function productImage(row: ProductRow) {
  const images = row.product_images ?? [];
  const primary = images.find((image) => image.is_primary) ?? images[0];
  return primary?.image_url ?? "";
}

function categorySlug(row: ProductRow) {
  if (Array.isArray(row.categories)) return row.categories[0]?.slug ?? "";
  return row.categories?.slug ?? "";
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    categorySlug: categorySlug(row),
    name: { en: row.name_en, fr: row.name_fr },
    description: {
      en: row.description_en ?? "",
      fr: row.description_fr ?? ""
    },
    productType: row.product_type,
    priceCents: row.price_cents ?? undefined,
    startingPriceCents: row.starting_price_cents ?? undefined,
    availability: row.is_hidden ? "hidden" : row.is_available ? (row.is_seasonal ? "seasonal" : "available") : "sold-out",
    isFeatured: Boolean(row.is_featured),
    leadTimeHours: row.preparation_lead_time_hours ?? 24,
    imageUrl: productImage(row)
  };
}

export async function getStorefrontCategories(): Promise<Category[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return localCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_fr, description_en, description_fr, image_url, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return localCategories;
  return (data as CategoryRow[]).map(mapCategory);
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return localProducts.filter((product) => product.availability !== "hidden");

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, category_id, name_en, name_fr, description_en, description_fr, product_type, price_cents, starting_price_cents, is_available, is_featured, is_seasonal, is_hidden, preparation_lead_time_hours, sort_order, categories(slug), product_images(image_url, is_primary, sort_order)"
    )
    .eq("is_hidden", false)
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "product_images", ascending: true });

  if (error || !data) return localProducts.filter((product) => product.availability !== "hidden");
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getFeaturedStorefrontProducts() {
  const products = await getStorefrontProducts();
  return products.filter((product) => product.isFeatured);
}

export async function getStorefrontProductBySlug(slug: string) {
  const products = await getStorefrontProducts();
  return products.find((product) => product.slug === slug);
}

export async function getStorefrontCategoryBySlug(slug: string) {
  const categories = await getStorefrontCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getStorefrontProductsByCategory(slug: string) {
  const products = await getStorefrontProducts();
  return products.filter((product) => product.categorySlug === slug);
}
