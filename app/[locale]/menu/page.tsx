import Link from "next/link";
import { MenuSearch } from "@/components/MenuSearch";
import { type Locale, t } from "@/lib/i18n";
import { getStorefrontCategories, getStorefrontProducts } from "@/lib/storefront";

export default async function MenuPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = t(locale);
  const [categories, products] = await Promise.all([getStorefrontCategories(), getStorefrontProducts()]);

  return (
    <main>
      <section className="page-hero menu-hero section-alt">
        <div className="container hero-copy">
          <p className="eyebrow">Rose</p>
          <h1>{copy.menu.title}</h1>
          <p className="lead">{copy.menu.lead}</p>
          <div className="hero-actions">
            <Link className="button primary" href={`/${locale}`}>
              {locale === "fr" ? "Accueil" : "Home"}
            </Link>
            <Link className="button" href={`/${locale}/checkout`}>
              {locale === "fr" ? "Commander" : "Order"}
            </Link>
          </div>
        </div>
      </section>

      <section className="container section menu-search-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{locale === "fr" ? "Cherche" : "Find"}</p>
            <h2>{locale === "fr" ? "Votre gourmandise" : "Your favorite treat"}</h2>
            <p className="lead">{locale === "fr" ? "Affinez votre recherche ou filtrez par catégorie" : "Search and filter by category for a sweet match."}</p>
          </div>
        </div>
        <MenuSearch products={products} categories={categories} locale={locale} placeholder={copy.menu.search} />
      </section>
    </main>
  );
}
