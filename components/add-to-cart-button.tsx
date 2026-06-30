"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function AddToCartButton({
  product,
  locale,
  customNotes,
  compact = false
}: {
  product: Product;
  locale: Locale;
  customNotes?: string;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const copy = t(locale);
  const disabled = product.availability === "sold-out" || product.availability === "hidden";

  return (
    <button
      className={`button ${compact ? "" : "primary"}`}
      disabled={disabled}
      onClick={() =>
        addItem({
          productId: product.id,
          slug: product.slug,
          name: product.name[locale],
          productType: product.productType,
          unitPriceCents: product.priceCents,
          startingPriceCents: product.startingPriceCents,
          imageUrl: product.imageUrl,
          customNotes
        })
      }
      type="button"
    >
      <ShoppingBag size={17} />
      {disabled ? copy.product.soldOut : copy.product.add}
    </button>
  );
}
