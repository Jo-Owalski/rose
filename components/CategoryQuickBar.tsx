"use client";

import Link from "next/link";
import type { Category } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import "./CategoryQuickBar.css";

interface CategoryQuickBarProps {
  categories: Category[];
  locale: Locale;
}

export function CategoryQuickBar({ categories, locale }: CategoryQuickBarProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="category-quick-bar-section">
      <div className="container">
        <div className="category-quick-bar-track">
          {categories.map((category) => {
            const name = category.name[locale] || category.name.fr || category.name.en;
            const image =
              category.imageUrl ||
              "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80";

            return (
              <Link
                key={category.id}
                href={`/${locale}/category/${category.slug}`}
                className="category-quick-chip"
              >
                <span className="category-quick-avatar">
                  <img src={image} alt={name} loading="lazy" />
                </span>
                <span className="category-quick-title">{name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
