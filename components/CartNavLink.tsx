"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { Locale } from "@/lib/i18n";

export function CartNavLink({ locale, label, icon }: { locale: Locale; label: string; icon: React.ReactNode }) {
  const { count } = useCart();

  return (
    <Link className="cart-link" href={`/${locale}/cart`}>
      {icon}
      <span>
        {label} {count > 0 ? `(${count})` : ""}
      </span>
    </Link>
  );
}
