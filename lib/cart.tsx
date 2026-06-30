"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ProductType } from "./catalog";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  productType: ProductType;
  quantity: number;
  unitPriceCents?: number;
  startingPriceCents?: number;
  imageUrl?: string;
  customNotes?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "rose-cart";

function linePrice(item: CartItem) {
  return item.unitPriceCents ?? item.startingPriceCents ?? 0;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalCents = items.reduce((sum, item) => sum + linePrice(item) * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      count,
      subtotalCents,
      addItem: (item, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.productId === item.productId);
          if (!existing) return [...current, { ...item, quantity }];
          return current.map((entry) =>
            entry.productId === item.productId
              ? { ...entry, quantity: entry.quantity + quantity, customNotes: item.customNotes ?? entry.customNotes }
              : entry
          );
        });
      },
      updateQuantity: (productId, quantity) => {
        setItems((current) =>
          current
            .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      updateNotes: (productId, notes) => {
        setItems((current) => current.map((item) => (item.productId === productId ? { ...item, customNotes: notes } : item)));
      },
      removeItem: (productId) => {
        setItems((current) => current.filter((item) => item.productId !== productId));
      },
      clearCart: () => setItems([])
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
