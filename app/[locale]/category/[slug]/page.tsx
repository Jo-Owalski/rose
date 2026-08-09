import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import type { Locale } from "@/lib/i18n";
import { getStorefrontCategoryBySlug, getStorefrontProductsByCategory } from "@/lib/storefront";

export default async function CategoryPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const category = await getStorefrontCategoryBySlug(slug);
  if (!category) notFound();
  const categoryProducts = await getStorefrontProductsByCategory(slug);

  return (
    <main className="container section category-page">
      <section className="panel category-header">
        <p className="eyebrow">Collection</p>
        <h1>{category.name[locale]}</h1>
        <p className="lead">{category.description[locale]}</p>
      </section>
      <div className="grid menu-grid category-products">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </main>
  );
}
