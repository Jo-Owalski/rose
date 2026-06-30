import { t, type Locale } from "@/lib/i18n";
import { getAdminCatalog } from "@/lib/admin-catalog";
import { ProductsManager } from "./products-manager";

const pageSize = 20;

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

export default async function AdminProductsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const copy = t(locale).admin;
  const catalog = await getAdminCatalog({ page: parsePage(query.page), pageSize });

  return (
    <main className="container section">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.products}</h1>
      <ProductsManager
        categories={catalog.categories}
        currentPage={catalog.page}
        locale={locale}
        products={catalog.products}
        totalPages={catalog.totalProductPages}
        totalProducts={catalog.totalProducts}
      />
    </main>
  );
}
