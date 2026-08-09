"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Category } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

interface CategorySliderProps {
  categories: Category[];
  locale: Locale;
}

export function CategorySlider({ categories, locale }: CategorySliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const cardWidth = clientWidth > 900 ? clientWidth / 3 : clientWidth > 600 ? clientWidth / 2 : clientWidth * 0.85;
    const calculatedIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, calculatedIndex), categories.length - 1));
  }, [categories.length]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    updateScrollState();
    slider.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      slider.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  // Autoplay functionality - automatically scrolls every 4 seconds when not hovered
  useEffect(() => {
    if (isHovered || categories.length <= 1) return;
    const timer = setInterval(() => {
      if (!sliderRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByAmount(1);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [isHovered, categories.length]);

  const scrollByAmount = (direction: number) => {
    if (!sliderRef.current) return;
    const containerWidth = sliderRef.current.clientWidth;
    const scrollDistance = direction * Math.max(containerWidth * 0.75, 280);
    sliderRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const cardWidth = container.clientWidth > 900 ? container.clientWidth / 3 : container.clientWidth > 600 ? container.clientWidth / 2 : container.clientWidth * 0.85;
    container.scrollTo({ left: index * cardWidth, behavior: "smooth" });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div
      className="category-slider-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="category-slider-container">
        {/* Previous Button */}
        <button
          className={`category-slider-btn prev ${!canScrollLeft ? "disabled" : ""}`}
          onClick={() => scrollByAmount(-1)}
          aria-label="Previous category"
          disabled={!canScrollLeft}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Scrollable Track */}
        <div className="category-slider-track" ref={sliderRef}>
          {categories.map((category) => {
            const name = category.name[locale] || category.name.fr || category.name.en;
            const description = category.description?.[locale] || category.description?.fr || "";
            const image =
              category.imageUrl ||
              "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80";

            return (
              <Link
                key={category.id}
                href={`/${locale}/category/${category.slug}`}
                className="category-slider-card"
              >
                <div className="category-card-image-box">
                  <img
                    src={image}
                    alt={name}
                    className="category-card-img"
                    loading="lazy"
                  />
                  <div className="category-card-overlay" />
                  <span className="category-card-badge">
                    <Sparkles size={13} />
                    {locale === "fr" ? "Voir la collection" : "Explore"}
                  </span>
                </div>
                <div className="category-card-details">
                  <h3 className="category-card-title">{name}</h3>
                  {description && <p className="category-card-desc">{description}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          className={`category-slider-btn next ${!canScrollRight ? "disabled" : ""}`}
          onClick={() => scrollByAmount(1)}
          aria-label="Next category"
          disabled={!canScrollRight}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="category-slider-dots">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            className={`category-slider-dot ${idx === activeIndex ? "active" : ""}`}
            onClick={() => scrollToIndex(idx)}
            aria-label={`Go to category ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
