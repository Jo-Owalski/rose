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
    <main className="container section section-alt detail">
      <img src={product.imageUrl} alt={product.name[locale]} />
      <section className="panel">
        <span className={`badge ${product.availability}`}>{availabilityLabel(product.availability, locale)}</span>
        <h1>{product.name[locale]}</h1>
        <p className="lead">{product.description[locale]}</p>
        <p className="price">{productPrice(product, locale)}</p>
        <p className="muted">
          {copy.product.leadTime}: {product.leadTimeHours} {copy.product.hours}
        </p>
        {product.productType === "custom" ? (
          <CustomNotesAdd product={product} locale={locale} />
        ) : (
          <AddToCartButton product={product} locale={locale} />
        )}
      </section>
    </main>
  );
}
