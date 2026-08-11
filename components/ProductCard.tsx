import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatMoney, type Locale, t } from "@/lib/i18n";
import { AddToCartButton } from "./add-to-cart-button";

export function availabilityLabel(status: Product["availability"], locale: Locale) {
  const labels = {
    en: {
      available: "Available",
      "sold-out": "Sold out",
      seasonal: "Seasonal",
      hidden: "Hidden"
    },
    fr: {
      available: "Disponible",
      "sold-out": "Épuisé",
      seasonal: "Saisonnier",
      hidden: "Caché"
    }
  };

  return labels[locale][status];
}

export function productPrice(product: Product, locale: Locale) {
  if (product.productType === "custom") {
    return `${t(locale).product.from} ${formatMoney(product.startingPriceCents, locale)}`;
  }

  return formatMoney(product.priceCents, locale);
}

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <article className="card">
      <Link className="product-media" href={`/${locale}/product/${product.slug}`}>
        <img className="product-image" src={product.imageUrl} alt={product.name[locale]} loading="lazy" />
        <span className={`product-badge ${product.availability}`}>
          {availabilityLabel(product.availability, locale)}
        </span>
      </Link>
      <div className="card-body">
        <div className="card-header-row">
          <h3>{product.name[locale]}</h3>
          <span className="price-tag">{productPrice(product, locale)}</span>
        </div>
        <p className="description">{product.description[locale]}</p>
        <div className="card-footer">
          <Link className="button-secondary" href={`/${locale}/product/${product.slug}`}>
            {locale === 'fr' ? 'Détails' : 'Details'}
          </Link>
          <AddToCartButton product={product} locale={locale} compact />
        </div>
      </div>
    </article>
  );
}
