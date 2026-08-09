"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import type { Category } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

interface CategoryHeroSliderProps {
  categories: Category[];
  locale: Locale;
}

export function CategoryHeroSlider({ categories, locale }: CategoryHeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const total = categories.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay functionality
  useEffect(() => {
    if (isHovered || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [isHovered, nextSlide, total]);

  // Touch navigation for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    setTouchStart(null);
  };

  if (!categories || categories.length === 0) return null;

  const currentCat = categories[currentIndex];
  const name = currentCat.name[locale] || currentCat.name.fr || currentCat.name.en;
  const description = currentCat.description?.[locale] || currentCat.description?.fr || "";
  const image =
    currentCat.imageUrl ||
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80";

  return (
    <div
      className="hero-category-slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with smooth transition key */}
      <div className="hero-slider-bg">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className={`hero-slider-slide ${idx === currentIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${cat.imageUrl || image})` }}
          />
        ))}
        <div className="hero-slider-overlay" />
      </div>

      {/* Slide Content Box */}
      <div className="container hero-slider-content-container">
        {/* Left Arrow */}
        <button
          className="hero-slider-arrow left"
          onClick={prevSlide}
          aria-label="Catégorie précédente"
        >
          <ChevronLeft size={36} />
        </button>

        {/* Center Content */}
        <div className="hero-slider-center">
          <span className="hero-slider-eyebrow">
            <Sparkles size={16} />
            {locale === "fr" ? `Catégorie ${currentIndex + 1} sur ${total}` : `Category ${currentIndex + 1} of ${total}`}
          </span>
          <h2 className="hero-slider-title">{name}</h2>
          {description && <p className="hero-slider-lead">{description}</p>}
          <div className="hero-slider-actions">
            <Link
              href={`/${locale}/category/${currentCat.slug}`}
              className="hero-slider-button"
            >
              <span>{locale === "fr" ? "DÉCOUVRIR" : "EXPLORE"}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Right Arrow */}
        <button
          className="hero-slider-arrow right"
          onClick={nextSlide}
          aria-label="Catégorie suivante"
        >
          <ChevronRight size={36} />
        </button>
      </div>

      {/* Pagination Dots at bottom */}
      <div className="hero-slider-dots-bar">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            className={`hero-slider-dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Aller à la catégorie ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
