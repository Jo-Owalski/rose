import { t, type Locale } from "@/lib/i18n";
import { getAdminCategories } from "@/lib/admin-catalog";
import { CategoriesManager } from "./categories-manager";

const pageSize = 20;

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}

export default async function AdminCategoriesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const copy = t(locale).admin;
  const result = await getAdminCategories({ page: parsePage(query.page), pageSize });

  return (
    <main className="container section">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.categories}</h1>
      <CategoriesManager
        categories={result.categories}
        currentPage={result.page}
        locale={locale}
        total={result.total}
        totalPages={result.totalPages}
      />
    </main>
  );
}
