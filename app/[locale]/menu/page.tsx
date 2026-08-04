import { MenuSearch } from "@/components/MenuSearch";
import { type Locale, t } from "@/lib/i18n";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/storefront";

export default async function MenuPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = t(locale);
  const [categories, products] = await Promise.all([getStorefrontCategories(), getStorefrontProducts()]);

  return (
    <main className="container">
      <section className="menu-hero section section-alt">
        <p className="eyebrow">Rose</p>
        <h1>{copy.menu.title}</h1>
        <p className="lead">{copy.menu.lead}</p>
      </section>

      <section className="section">
        <MenuSearch products={products} categories={categories} locale={locale} placeholder={copy.menu.search} />
      </section>
    </main>
  );
}
