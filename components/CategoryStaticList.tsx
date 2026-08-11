"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import type { Category } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

interface CategoryStaticListProps {
  categories: Category[];
  locale: Locale;
}

export function CategoryStaticList({ categories, locale }: CategoryStaticListProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
      {categories.map((cat) => {
        const name = cat.name[locale] || cat.name.fr || cat.name.en;
        const description = cat.description?.[locale] || cat.description?.fr || "";

        return (
          <Link
            key={cat.id}
            href={`/${locale}/category/${cat.slug}`}
            className="group card h-full flex flex-col bg-base-100 border border-base-300/60 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col flex-1 px-5 pt-5 pb-6 gap-2">
              <h3 className="card-title text-lg leading-snug min-h-[1.75rem]">
                <Tag size={16} className="mr-1 inline-block align-middle" />
                {name}
              </h3>

              <p className="text-sm text-base-content/60 line-clamp-2 min-h-[2.5rem]">
                {description}
              </p>

              <div className="flex justify-between items-center mt-auto pt-4 border-t border-base-300/60">
                <span className="badge badge-outline font-medium">
                  {cat.slug.toUpperCase()}
                </span>
                <span className="badge badge-primary gap-1 font-medium group-hover:gap-1.5 transition-all">
                  {locale === "fr" ? "Voir" : "View"}
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}