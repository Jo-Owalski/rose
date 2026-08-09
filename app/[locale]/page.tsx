import Link from "next/link";
import { Truck } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryStaticList } from "@/components/CategoryStaticList";
import { type Locale, t } from "@/lib/i18n";
import { getFeaturedStorefrontProducts, getStorefrontCategories } from "@/lib/storefront";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const copy = t(locale);
  const [categories, featuredProducts] = await Promise.all([getStorefrontCategories(), getFeaturedStorefrontProducts()]);

  return (
    <main>
      <section className="hero-static page-hero">
        <img
          src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80"
          alt="Bakery hero"
          loading="lazy"
          className="hero-static-image"
        />
        <div className="container hero-copy">
          <div className="hero-content">
            <p className="eyebrow">Rose</p>
            <h1>{locale === "fr" ? "Pâtisserie artisanale, conçue pour vous" : "Artisan pastry crafted for you"}</h1>
            <p className="lead">{copy.home.fulfillmentText}</p>
            <div className="hero-actions">
              <Link className="button primary" href={`/${locale}/menu`}>
                {copy.nav.menu}
              </Link>
              <Link className="button" href={`/${locale}/testimonials`}>
                {copy.nav.testimonials}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Rose</p>
            <h2>{copy.home.featured}</h2>
            <p className="lead">{locale === "fr" ? "Nos favoris du moment" : "Our favorites right now"}</p>
          </div>
          <Link className="pill-link" href={`/${locale}/menu`}>
            {copy.nav.menu}
          </Link>
        </div>

        <div className="grid featured-products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </section>

      <section className="container section section-alt home-categories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{locale === "fr" ? "Collections" : "Collections"}</p>
            <h2>{locale === "fr" ? "Nos catégories" : "Explore our categories"}</h2>
            <p className="lead">{locale === "fr" ? "Des créations pensées pour chaque envie." : "Delightful creations made for every mood."}</p>
          </div>
        </div>
        <CategoryStaticList categories={categories} locale={locale} />
      </section>

      <section className="container section checkout-invite">
        <div className="panel">
          <p className="eyebrow">
            <Truck size={15} /> {locale === "fr" ? "Confirmation manuelle" : "Manual confirmation"}
          </p>
          <h2>{copy.home.fulfillmentTitle}</h2>
          <p className="lead">{copy.home.fulfillmentText}</p>
        </div>
      </section>
    </main>
  );
}
