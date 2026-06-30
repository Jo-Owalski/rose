import type { Availability, ProductType } from "./catalog";
import { createServiceSupabaseClient } from "./supabase/server";

export type AdminCategory = {
  id: string;
  slug: string;
  nameEn: string;
  nameFr: string;
  descriptionEn?: string;
  descriptionFr?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive: boolean;
};

export type AdminProduct = {
  id: string;
  slug: string;
  categoryId: string | null;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  productType: ProductType;
  priceCents: number | null;
  startingPriceCents: number | null;
  availability: Availability;
  isFeatured: boolean;
  isSeasonal: boolean;
  isHidden: boolean;
  leadTimeHours: number;
  sortOrder: number;
  imageUrl: string;
};

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
  description_en?: string | null;
  description_fr?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  is_active: boolean | null;
};

function availability(row: ProductRow): Availability {
  if (row.is_hidden) return "hidden";
  if (row.is_seasonal) return "seasonal";
  if (!row.is_available) return "sold-out";
  return "available";
}

function primaryImage(row: ProductRow) {
  const images = row.product_images ?? [];
  return (images.find((image) => image.is_primary) ?? images[0])?.image_url ?? "";
}

function mapProduct(row: ProductRow): AdminProduct {
  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    nameEn: row.name_en,
    nameFr: row.name_fr,
    descriptionEn: row.description_en ?? "",
    descriptionFr: row.description_fr ?? "",
    productType: row.product_type,
    priceCents: row.price_cents,
    startingPriceCents: row.starting_price_cents,
    availability: availability(row),
    isFeatured: Boolean(row.is_featured),
    isSeasonal: Boolean(row.is_seasonal),
    isHidden: Boolean(row.is_hidden),
    leadTimeHours: row.preparation_lead_time_hours ?? 24,
    sortOrder: row.sort_order ?? 0,
    imageUrl: primaryImage(row)
  };
}

export async function getAdminCatalog({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return { products: [], categories: [], totalProducts: 0, page, pageSize, totalProductPages: 1 };

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 50);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, category_id, name_en, name_fr, description_en, description_fr, product_type, price_cents, starting_price_cents, is_available, is_featured, is_seasonal, is_hidden, preparation_lead_time_hours, sort_order, product_images(image_url, is_primary, sort_order)",
        { count: "exact" }
      )
      .order("sort_order", { ascending: true })
      .order("sort_order", { referencedTable: "product_images", ascending: true })
      .range(from, to),
    supabase.from("categories").select("id, slug, name_en, name_fr, is_active").order("sort_order", { ascending: true })
  ]);

  const totalProducts = productsResult.count ?? 0;
  return {
    products: productsResult.error || !productsResult.data ? [] : (productsResult.data as unknown as ProductRow[]).map(mapProduct),
    totalProducts,
    page: safePage,
    pageSize: safePageSize,
    totalProductPages: Math.max(1, Math.ceil(totalProducts / safePageSize)),
    categories:
      categoriesResult.error || !categoriesResult.data
        ? []
        : (categoriesResult.data as CategoryRow[]).map((row) => ({
            id: row.id,
            slug: row.slug,
            nameEn: row.name_en,
            nameFr: row.name_fr,
            isActive: Boolean(row.is_active)
          }))
  };
}

export async function getAdminCategories({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return { categories: [], total: 0, page, pageSize, totalPages: 1 };

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 50);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const { data, error, count } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_fr, description_en, description_fr, image_url, sort_order, is_active", { count: "exact" })
    .order("sort_order", { ascending: true })
    .range(from, to);

  const total = count ?? 0;
  return {
    categories:
      error || !data
        ? []
        : (data as CategoryRow[]).map((row) => ({
            id: row.id,
            slug: row.slug,
            nameEn: row.name_en,
            nameFr: row.name_fr,
            descriptionEn: row.description_en ?? "",
            descriptionFr: row.description_fr ?? "",
            imageUrl: row.image_url ?? "",
            sortOrder: row.sort_order ?? 0,
            isActive: Boolean(row.is_active)
          })),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize))
  };
}
