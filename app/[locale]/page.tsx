import Link from "next/link";
import { CalendarHeart, CakeSlice, Coffee, Croissant, IceCream, Truck } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { type Locale, t } from "@/lib/i18n";
import { getFeaturedStorefrontProducts, getStorefrontCategories } from "@/lib/storefront";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = t(locale);
  const [categories, featuredProducts] = await Promise.all([getStorefrontCategories(), getFeaturedStorefrontProducts()]);

  return (
    <main>
      <section className="home-hero">
        <div className="container hero">
          <div className="hero-copy">
            <p className="eyebrow">{copy.home.eyebrow}</p>
            <h1>{copy.home.title}</h1>
            <p className="lead">{copy.home.lead}</p>
            <div className="hero-chips">
              <span className="hero-chip">
                <Croissant size={16} />
                Croissants chauds
              </span>
              <span className="hero-chip">
                <IceCream size={16} />
                Gâteaux fondants
              </span>
              <span className="hero-chip">
                <Coffee size={16} />
                Boîtes gourmandes
              </span>
            </div>
            <div className="hero-actions">
              <Link className="button primary" href={`/${locale}/menu`}>
                <CakeSlice size={18} />
                {copy.home.primary}
              </Link>
              <Link className="button" href={`/${locale}/product/birthday-cake`}>
                <CalendarHeart size={18} />
                {copy.home.secondary}
              </Link>
            </div>
          </div>
          <div className="hero-photo" role="img" aria-label="Assorted pastries on a bakery counter">
            <div className="hero-photo-note">
              <strong>{copy.home.heroTitle}</strong>
              <span>{copy.home.heroText}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Rose</p>
            <h2>{copy.home.featured}</h2>
          </div>
          <Link className="pill-link" href={`/${locale}/menu`}>
            {copy.nav.menu}
          </Link>
        </div>
        <div className="grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <section className="container section section-alt">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Collections</p>
            <h2>{copy.home.categories}</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" href={`/${locale}/category/${category.slug}`} key={category.id}>
              <strong>{category.name[locale]}</strong>
              <span className="muted">{category.description[locale]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="panel">
          <p className="eyebrow">
            <Truck size={15} /> Manual confirmation
          </p>
          <h2>{copy.home.fulfillmentTitle}</h2>
          <p className="lead">{copy.home.fulfillmentText}</p>
        </div>
      </section>
    </main>
  );
}
