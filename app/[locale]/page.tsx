import Link from "next/link";
import { CalendarHeart, CakeSlice, Coffee, Croissant, IceCream, Truck } from "lucide-react";
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
      {/* Static Hero Section */}
      <section className="hero-static">
        <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80" alt="Bakery hero" loading="lazy" className="hero-static-image" />
      </section>    <section className="container section">
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

<section className="container section">
  <div className="section-heading">
    <h2>Categories</h2>
  </div>
  <CategoryStaticList categories={categories} locale={locale} />
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
