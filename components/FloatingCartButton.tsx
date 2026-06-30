"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Locale } from "@/lib/i18n";

export function FloatingCartButton({ locale, label }: { locale: Locale; label: string }) {
  const { count, subtotalCents } = useCart();

  if (count === 0) return null;

  const total = new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD"
  }).format(subtotalCents / 100);

  return (
    <Link className="floating-cart" href={`/${locale}/cart`} aria-label={`${label}: ${count}`}>
      <span className="floating-cart-icon">
        <ShoppingBag size={22} />
        <span>{count}</span>
      </span>
      <span className="floating-cart-copy">
        <strong>{label}</strong>
        <small>{total}</small>
      </span>
    </Link>
  );
}
