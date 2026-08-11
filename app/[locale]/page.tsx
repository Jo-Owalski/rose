import Link from "next/link";
import { CalendarHeart, CakeSlice, Truck, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { type Locale, t } from "@/lib/i18n";
import { getFeaturedStorefrontProducts, getStorefrontCategories } from "@/lib/storefront";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = t(locale);
  const [categories, featuredProducts] = await Promise.all([getStorefrontCategories(), getFeaturedStorefrontProducts()]);

  return (
    <main>
      {/* HERO SECTION - RESTRUCTURED */}
      <section className="home-hero">
        <div className="container hero">
          <div className="hero-copy">
            <span className="eyebrow">{copy.home.eyebrow}</span>
            <h1>{copy.home.title}</h1>
            <p className="lead">{copy.home.lead}</p>
            <div className="hero-actions">
              <Link className="button primary" href={`/${locale}/menu`}>
                <CakeSlice size={20} />
                {copy.home.primary}
              </Link>
              <Link className="button" href={`/${locale}/product/birthday-cake`}>
                <CalendarHeart size={20} />
                {copy.home.secondary}
              </Link>
            </div>
          </div>
          <div className="hero-photo" role="img" aria-label="Bakery counter" />
        </div>
      </section>

      {/* COLLECTIONS GRID - PERFECT ALIGNMENT */}
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Collections</span>
            <h2>{locale === 'fr' ? 'Magasiner par catégorie' : 'Shop by category'}</h2>
          </div>
        </div>
        <div className="category-grid-custom">
          {categories.map((category) => (
            <Link className="category-card-custom" href={`/${locale}/category/${category.slug}`} key={category.id}>
              <div className="category-card-custom-content">
                <strong>{category.name[locale]}</strong>
                <p>{category.description[locale]}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS - PERFECT ALIGNMENT */}
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Sélection</span>
            <h2>{copy.home.featured}</h2>
          </div>
          <Link className="button" href={`/${locale}/menu`} style={{ padding: '8px 20px', minHeight: 'auto', background: 'transparent', border: '1px solid var(--border)' }}>
            {copy.nav.menu} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>

      {/* INFORMATION PANEL */}
      <section className="container section">
        <div className="panel-modern">
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <Truck size={24} /> {locale === 'fr' ? 'Livraison & Retrait' : 'Delivery & Pickup'}
          </div>
          <h2>{copy.home.fulfillmentTitle}</h2>
          <p className="lead" style={{ margin: '0 auto 40px', maxWidth: '750px' }}>{copy.home.fulfillmentText}</p>
          <Link className="button primary" href={`/${locale}/menu`}>
            {locale === 'fr' ? 'Parcourir le menu' : 'Browse the menu'}
          </Link>
        </div>
      </section>
    </main>
  );
}
