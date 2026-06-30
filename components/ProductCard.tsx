import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      "sold-out": "Epuise",
      seasonal: "Saisonnier",
      hidden: "Cache"
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
        <img className="product-image" src={product.imageUrl} alt={product.name[locale]} />
      </Link>
      <div className="card-body">
        <div className="status-row">
          <span className={`badge ${product.availability}`}>{availabilityLabel(product.availability, locale)}</span>
          <span className="price">{productPrice(product, locale)}</span>
        </div>
        <h3>{product.name[locale]}</h3>
        <p className="muted">{product.description[locale]}</p>
        <div className="price-row">
          <Link className="pill-link" href={`/${locale}/product/${product.slug}`}>
            <ArrowRight size={16} /> Details
          </Link>
          <AddToCartButton product={product} locale={locale} compact />
        </div>
      </div>
    </article>
  );
}
