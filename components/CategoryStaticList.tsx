"use client";

import Link from "next/link";
import type { Category } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

interface CategoryStaticListProps {
  categories: Category[];
  locale: Locale;
}

export function CategoryStaticList({ categories, locale }: CategoryStaticListProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="category-static-grid">
      {categories.map((cat) => {
        const name = cat.name[locale] || cat.name.fr || cat.name.en;
        const description = cat.description?.[locale] || cat.description?.fr || "";
        return (
          <Link key={cat.id} className="category-static-card" href={`/${locale}/category/${cat.slug}`}>
            <div className="category-static-badge">{cat.slug.toUpperCase()}</div>
            <div>
              <h3 className="category-static-title">{name}</h3>
              {description && <p className="category-static-desc">{description}</p>}
            </div>
            <span className="badge available">{locale === "fr" ? "Voir" : "View"}</span>
          </Link>
        );
      })}
    </div>
  );
}
