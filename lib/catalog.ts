import type { Locale } from "./i18n";

export type ProductType = "individual" | "bundle" | "custom";
export type Availability = "available" | "sold-out" | "seasonal" | "hidden";

export type Category = {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  sortOrder: number;
};

export type Product = {
  id: string;
  slug: string;
  categorySlug: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  productType: ProductType;
  priceCents?: number;
  startingPriceCents?: number;
  availability: Availability;
  isFeatured: boolean;
  leadTimeHours: number;
  imageUrl: string;
};

export const categories: Category[] = [
  {
    id: "cat-bakeries",
    slug: "bakeries",
    name: { en: "Bakeries", fr: "Boulangerie" },
    description: {
      en: "Fresh breads, rolls, and everyday bakery staples.",
      fr: "Pains frais, petits pains et essentiels de boulangerie."
    },
    sortOrder: 1
  },
  {
    id: "cat-pastries",
    slug: "pastries",
    name: { en: "Pastries", fr: "Patisseries" },
    description: {
      en: "Croissants, rolls, tarts, and sweet pastry favorites.",
      fr: "Croissants, brioches, tartelettes et douceurs favorites."
    },
    sortOrder: 2
  },
  {
    id: "cat-cakes",
    slug: "cakes",
    name: { en: "Cakes", fr: "Gateaux" },
    description: {
      en: "Birthday cakes, custom cakes, and celebration orders.",
      fr: "Gateaux d'anniversaire, gateaux personnalises et celebrations."
    },
    sortOrder: 3
  },
  {
    id: "cat-bundles",
    slug: "bundles",
    name: { en: "Bundles / packs", fr: "Boites / ensembles" },
    description: {
      en: "Curated pastry boxes and group packs for events.",
      fr: "Boites de patisseries et ensembles pour evenements."
    },
    sortOrder: 4
  },
  {
    id: "cat-african",
    slug: "african-food",
    name: { en: "Future African food", fr: "Cuisine africaine a venir" },
    description: {
      en: "Future warm food offers inspired by African kitchens.",
      fr: "Futures offres chaudes inspirees des cuisines africaines."
    },
    sortOrder: 5
  },
  {
    id: "cat-european",
    slug: "european-food",
    name: { en: "Future European food", fr: "Cuisine europeenne a venir" },
    description: {
      en: "Future savory European food and catering additions.",
      fr: "Futures additions salees europeennes et traiteur."
    },
    sortOrder: 6
  }
];

export const products: Product[] = [
  {
    id: "prod-butter-croissants",
    slug: "butter-croissants",
    categorySlug: "pastries",
    name: { en: "Butter croissants", fr: "Croissants au beurre" },
    description: {
      en: "Flaky, golden croissants baked in small batches.",
      fr: "Croissants feuilletes et dores, cuits en petites fournées."
    },
    productType: "individual",
    priceCents: 450,
    availability: "available",
    isFeatured: true,
    leadTimeHours: 12,
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "prod-birthday-cake",
    slug: "birthday-cake",
    categorySlug: "cakes",
    name: { en: "Custom birthday cake", fr: "Gateau d'anniversaire personnalise" },
    description: {
      en: "Made-to-order celebration cake with flavor, size, message, and decoration notes.",
      fr: "Gateau de celebration sur mesure avec saveur, taille, message et decoration."
    },
    productType: "custom",
    startingPriceCents: 6500,
    availability: "available",
    isFeatured: true,
    leadTimeHours: 48,
    imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "prod-pastry-party-box",
    slug: "pastry-party-box",
    categorySlug: "bundles",
    name: { en: "Pastry party box", fr: "Boite de patisseries festives" },
    description: {
      en: "A dozen assorted pastries for brunches, birthdays, and office treats.",
      fr: "Douze patisseries assorties pour brunchs, anniversaires et bureaux."
    },
    productType: "bundle",
    priceCents: 4000,
    availability: "seasonal",
    isFeatured: true,
    leadTimeHours: 24,
    imageUrl: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "prod-sourdough",
    slug: "country-sourdough",
    categorySlug: "bakeries",
    name: { en: "Country sourdough", fr: "Pain au levain de campagne" },
    description: {
      en: "Crusty sourdough loaf with a soft tangy crumb.",
      fr: "Pain au levain croustillant avec mie douce et legerement acidulee."
    },
    productType: "individual",
    priceCents: 900,
    availability: "available",
    isFeatured: false,
    leadTimeHours: 18,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "prod-mini-tarts",
    slug: "mini-fruit-tarts",
    categorySlug: "pastries",
    name: { en: "Mini fruit tarts", fr: "Mini tartelettes aux fruits" },
    description: {
      en: "Shortcrust shells, pastry cream, and seasonal fruit.",
      fr: "Pate sablee, creme patissiere et fruits de saison."
    },
    productType: "individual",
    priceCents: 550,
    availability: "available",
    isFeatured: false,
    leadTimeHours: 12,
    imageUrl: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "prod-savory-preview",
    slug: "future-savory-box",
    categorySlug: "european-food",
    name: { en: "Future savory box", fr: "Future boite salee" },
    description: {
      en: "A future catering-style food box for savory events.",
      fr: "Une future boite de type traiteur pour evenements sales."
    },
    productType: "bundle",
    priceCents: 5200,
    availability: "sold-out",
    isFeatured: false,
    leadTimeHours: 36,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
  }
];

export function visibleProducts() {
  return products.filter((product) => product.availability !== "hidden");
}

export function featuredProducts() {
  return visibleProducts().filter((product) => product.isFeatured);
}

export function productBySlug(slug: string) {
  return visibleProducts().find((product) => product.slug === slug);
}

export function categoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function productsByCategory(slug: string) {
  return visibleProducts().filter((product) => product.categorySlug === slug);
}
