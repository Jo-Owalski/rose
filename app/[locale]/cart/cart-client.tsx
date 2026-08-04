"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatMoney, type Locale, t } from "@/lib/i18n";

export function CartClient({ locale }: { locale: Locale }) {
  const { items, subtotalCents, updateQuantity, updateNotes, removeItem, clearCart } = useCart();
  const copy = t(locale);

  return (
    <main className="container section section-alt">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Rose</p>
          <h1>{copy.cart.title}</h1>
        </div>
        {items.length > 0 && (
          <button className="button danger" onClick={clearCart} type="button">
            <Trash2 size={17} />
            {copy.cart.clear}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="panel">
          <p className="lead">{copy.cart.empty}</p>
          <Link className="button primary" href={`/${locale}/menu`}>
            {copy.nav.menu}
          </Link>
        </div>
      ) : (
        <div className="detail">
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.productId}>
                {item.imageUrl && (
                  <div className="cart-thumb-wrap">
                    <img className="cart-thumb" src={item.imageUrl} alt={item.name} />
                  </div>
                )}
                <div className="cart-item-main">
                  <div className="cart-item-heading">
                    <div>
                      <h3>{item.name}</h3>
                      <span className="cart-type">{item.productType}</span>
                    </div>
                    <p className="price cart-line-price">{formatMoney((item.unitPriceCents ?? item.startingPriceCents ?? 0) * item.quantity, locale)}</p>
                  </div>
                  <div className="cart-item-footer">
                    <div className="qty" aria-label="Quantity">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} type="button">
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} type="button">
                        +
                      </button>
                    </div>
                    <button
                      className="icon-button danger"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.productId)}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <label className="cart-note">
                  <span>{copy.cart.notes}</span>
                  <textarea
                    value={item.customNotes ?? ""}
                    onChange={(event) => updateNotes(item.productId, event.target.value)}
                    placeholder={locale === "fr" ? "Saveur, allergies, message..." : "Flavor, allergies, message..."}
                  />
                </label>
              </article>
            ))}
          </div>
          <aside className="panel">
            <h2>{copy.cart.subtotal}</h2>
            <p className="price">{formatMoney(subtotalCents, locale)}</p>
            <Link className="button primary" href={`/${locale}/checkout`}>
              {copy.cart.continue}
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
