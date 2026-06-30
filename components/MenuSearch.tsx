"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category, Product, ProductType, Availability } from "@/lib/catalog";
import { type Locale, t } from "@/lib/i18n";
import { availabilityLabel, ProductCard } from "./ProductCard";

type FilterValue = "all";

export function MenuSearch({
  products,
  categories,
  locale,
  placeholder
}: {
  products: Product[];
  categories: Category[];
  locale: Locale;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterValue | string>("all");
  const [productType, setProductType] = useState<FilterValue | ProductType>("all");
  const [availability, setAvailability] = useState<FilterValue | Availability>("all");
  const copy = t(locale);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) =>
      (category === "all" || product.categorySlug === category) &&
      (productType === "all" || product.productType === productType) &&
      (availability === "all" || product.availability === availability) &&
      (!normalized ||
        [product.name[locale], product.description[locale], product.categorySlug].some((value) =>
          value.toLowerCase().includes(normalized)
        ))
    );
  }, [availability, category, locale, productType, products, query]);

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setProductType("all");
    setAvailability("all");
  }

  return (
    <>
      <div className="toolbar">
        <label className="search-wrap">
          <Search size={18} />
          <input className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} />
        </label>
        <div className="result-count">
          {filtered.length} {copy.menu.results}
        </div>
      </div>

      <section className="filters" aria-label={copy.menu.filters}>
        <label className="filter-field">
          <span>{copy.nav.categories}</span>
          <span className="select-control">
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">{copy.menu.allCategories}</option>
              {categories.map((entry) => (
                <option key={entry.id} value={entry.slug}>
                  {entry.name[locale]}
                </option>
              ))}
            </select>
          </span>
        </label>
        <label className="filter-field">
          <span>Type</span>
          <span className="select-control">
            <select value={productType} onChange={(event) => setProductType(event.target.value as FilterValue | ProductType)}>
              <option value="all">{copy.menu.allTypes}</option>
              <option value="individual">{copy.menu.typeIndividual}</option>
              <option value="bundle">{copy.menu.typeBundle}</option>
              <option value="custom">{copy.menu.typeCustom}</option>
            </select>
          </span>
        </label>
        <label className="filter-field">
          <span>Status</span>
          <span className="select-control">
            <select value={availability} onChange={(event) => setAvailability(event.target.value as FilterValue | Availability)}>
              <option value="all">{copy.menu.allAvailability}</option>
              <option value="available">{availabilityLabel("available", locale)}</option>
              <option value="seasonal">{availabilityLabel("seasonal", locale)}</option>
              <option value="sold-out">{availabilityLabel("sold-out", locale)}</option>
            </select>
          </span>
        </label>
        <button className="button" type="button" onClick={resetFilters}>
          {copy.menu.reset}
        </button>
      </section>

      <div className="active-filter-row">
        {category !== "all" && <span className="badge">{categories.find((entry) => entry.slug === category)?.name[locale]}</span>}
        {productType !== "all" && <span className="badge">{productType}</span>}
        {availability !== "all" && <span className={`badge ${availability}`}>{availabilityLabel(availability, locale)}</span>}
      </div>

      <div className="grid menu-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </>
  );
}
