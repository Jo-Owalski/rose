import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Locale } from "@/lib/i18n";
import { getStorefrontCategoryBySlug, getStorefrontProductsByCategory } from "@/lib/storefront";

export default async function CategoryPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const category = await getStorefrontCategoryBySlug(slug);
  if (!category) notFound();
  const categoryProducts = await getStorefrontProductsByCategory(slug);

  return (
    <main className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header */}
      <section className="mb-10">
        <Link
          href={`/${locale}/menu`}
          className="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          {locale === "fr" ? "Retour au menu" : "Back to menu"}
        </Link>

        <p className="eyebrow text-primary font-semibold text-sm uppercase tracking-wide mb-1">
          {locale === "fr" ? "Collection" : "Collection"}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
          {category.name[locale]}
        </h1>
        {category.description?.[locale] && (
          <p className="text-base-content/60 text-lg max-w-2xl">
            {category.description[locale]}
          </p>
        )}

        <div className="mt-4 text-sm text-base-content/50">
          {categoryProducts.length}{" "}
          {locale === "fr"
            ? categoryProducts.length > 1
              ? "produits"
              : "produit"
            : categoryProducts.length === 1
              ? "product"
              : "products"}
        </div>
      </section>

      {/* Grille de produits */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-base-300 rounded-xl">
          <PackageOpen className="text-base-content/30 mb-3" size={40} />
          <p className="text-base-content/60">
            {locale === "fr"
              ? "Aucun produit disponible dans cette catégorie pour le moment."
              : "No products available in this category right now."}
          </p>
        </div>
      )}
    </main>
  );
}