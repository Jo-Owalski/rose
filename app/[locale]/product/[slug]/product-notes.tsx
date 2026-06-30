"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { type Locale, t } from "@/lib/i18n";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function CustomNotesAdd({ product, locale }: { product: Product; locale: Locale }) {
  const [notes, setNotes] = useState("");
  const copy = t(locale);

  return (
    <div className="field">
      <span>{copy.cart.notes}</span>
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={copy.product.notesPlaceholder} />
      <AddToCartButton product={product} locale={locale} customNotes={notes} />
    </div>
  );
}
