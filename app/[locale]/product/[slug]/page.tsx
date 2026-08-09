import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { availabilityLabel, productPrice } from "@/components/ProductCard";
import { type Locale, t } from "@/lib/i18n";
import { getStorefrontProductBySlug } from "@/lib/storefront";
import { CustomNotesAdd } from "./product-notes";

export default async function ProductPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const product = await getStorefrontProductBySlug(slug);
  if (!product) notFound();
  const copy = t(locale);

  return (
    <main className="container section detail product-detail-page">
      <section className="panel product-detail-gallery">
        <img src={product.imageUrl} alt={product.name[locale]} className="product-detail-image" />
      </section>

      <section className="panel product-detail-summary">
        <div className="price-row">
          <span className={`badge ${product.availability}`}>{availabilityLabel(product.availability, locale)}</span>
          <span className="price">{productPrice(product, locale)}</span>
        </div>
        <h1>{product.name[locale]}</h1>
        <p className="lead">{product.description[locale]}</p>
        <p className="muted">
          {copy.product.leadTime}: {product.leadTimeHours} {copy.product.hours}
        </p>
        <div className="row-actions">
          {product.productType === "custom" ? (
            <CustomNotesAdd product={product} locale={locale} />
          ) : (
            <AddToCartButton product={product} locale={locale} />
          )}
        </div>
      </section>
    </main>
  );
}
