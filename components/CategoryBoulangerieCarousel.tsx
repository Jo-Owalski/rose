"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Croissant, Sparkles } from "lucide-react";
import type { Category } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

interface CategoryBoulangerieCarouselProps {
  categories: Category[];
  locale: Locale;
}

export function CategoryBoulangerieCarousel({
  categories,
  locale
}: CategoryBoulangerieCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = categories.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isHovered || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, nextSlide, total]);

  if (!categories || categories.length === 0) return null;

  const current = categories[currentIndex];
  const name = current.name[locale] || current.name.fr || current.name.en;
  const description = current.description?.[locale] || current.description?.fr || "";
  const image =
    current.imageUrl ||
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80";

  return (
    <section
      className="boulangerie-hero-section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left Navigation Chevron */}
      <button
        className="boulangerie-arrow left"
        onClick={prevSlide}
        aria-label="Catégorie précédente"
      >
        <ChevronLeft size={36} />
      </button>

      {/* Main Center Content */}
      <div className="boulangerie-hero-content" key={current.id}>
        {/* Emblem Graphic Oval Badge */}
        <div className="boulangerie-badge-frame">
          <img src={image} alt={name} className="boulangerie-badge-img" />
          <div className="boulangerie-badge-overlay">
            <span className="boulangerie-badge-script">{name}</span>
            <span className="boulangerie-badge-sublogo">
              <Croissant size={20} />
              <span>ROSE</span>
            </span>
          </div>
        </div>

        {/* Title under badge */}
        <h1 className="boulangerie-hero-title">
          {name} : {description || "découvrez nos spécialités artisanales"}
        </h1>

        {/* Yellow Pill Button DÉCOUVRIR */}
        <Link
          href={`/${locale}/category/${current.slug}`}
          className="boulangerie-yellow-pill-btn"
        >
          {locale === "fr" ? "DÉCOUVRIR" : "DISCOVER"}
        </Link>
      </div>

      {/* Right Navigation Chevron */}
      <button
        className="boulangerie-arrow right"
        onClick={nextSlide}
        aria-label="Catégorie suivante"
      >
        <ChevronRight size={36} />
      </button>

      {/* Bottom Circle Outline Pagination Dots */}
      <div className="boulangerie-pagination-dots">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            className={`boulangerie-dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Aller à la catégorie ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
