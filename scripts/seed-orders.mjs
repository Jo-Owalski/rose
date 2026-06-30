import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function readLocalEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line
            .slice(index + 1)
            .trim()
            .replace(/^['"]|['"]$/g, "");
          return [key, value];
        })
    );
  } catch {
    return {};
  }
}

const env = { ...readLocalEnv(), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const fallbackProducts = [
  {
    slug: "custom-birthday-cake",
    name_en: "Custom birthday cake",
    product_type: "custom",
    price_cents: null,
    starting_price_cents: 6500
  },
  {
    slug: "mini-fruit-tarts",
    name_en: "Mini fruit tarts",
    product_type: "individual",
    price_cents: 550,
    starting_price_cents: null
  },
  {
    slug: "festive-pastry-box",
    name_en: "Festive pastry box",
    product_type: "bundle",
    price_cents: 8000,
    starting_price_cents: null
  },
  {
    slug: "macaron-gift-box",
    name_en: "Macaron gift box",
    product_type: "bundle",
    price_cents: 3600,
    starting_price_cents: null
  },
  {
    slug: "chocolate-eclairs",
    name_en: "Chocolate eclairs",
    product_type: "individual",
    price_cents: 450,
    starting_price_cents: null
  }
];

const productSlugs = fallbackProducts.map((product) => product.slug);
const { data: products, error: productsError } = await supabase
  .from("products")
  .select("id, slug, name_en, product_type, price_cents, starting_price_cents")
  .in("slug", productSlugs);

if (productsError) {
  throw new Error(`Could not read products: ${productsError.message}`);
}

function findProduct(slug) {
  return (
    products?.find((product) => product.slug === slug) ??
    fallbackProducts.find((product) => product.slug === slug)
  );
}

function unitPrice(product) {
  return product?.price_cents ?? product?.starting_price_cents ?? 0;
}

function orderDate(hoursFromNow) {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();
}

const orderTemplates = [
  {
    customer_name: "Seed Customer 01",
    customer_phone: "+1 514 555 0101",
    customer_email: "seed01@example.com",
    preferred_language: "fr",
    fulfillment_method: "pickup",
    preferred_datetime: orderDate(24),
    customer_notes: "Pickup before lunch. Add a small gift card.",
    status: "new",
    sent_via: "whatsapp",
    items: [
      { slug: "custom-birthday-cake", quantity: 1, custom_notes: "Vanilla sponge, pink roses, text: Joyeux anniversaire Lea." },
      { slug: "mini-fruit-tarts", quantity: 6 }
    ]
  },
  {
    customer_name: "Seed Customer 02",
    customer_phone: "+1 514 555 0102",
    customer_email: "seed02@example.com",
    preferred_language: "en",
    fulfillment_method: "delivery",
    delivery_address: "120 Rue Saint-Paul O, Montreal, QC",
    preferred_datetime: orderDate(30),
    customer_notes: "Call when arriving at reception.",
    status: "contacted",
    sent_via: "email",
    items: [
      { slug: "festive-pastry-box", quantity: 1, custom_notes: "No nuts if possible." },
      { slug: "chocolate-eclairs", quantity: 8 }
    ]
  },
  {
    customer_name: "Seed Customer 03",
    customer_phone: "+1 514 555 0103",
    customer_email: "seed03@example.com",
    preferred_language: "fr",
    fulfillment_method: "pickup",
    preferred_datetime: orderDate(48),
    customer_notes: "Commande pour un bureau de 12 personnes.",
    status: "confirmed",
    sent_via: "whatsapp",
    items: [
      { slug: "macaron-gift-box", quantity: 2 },
      { slug: "mini-fruit-tarts", quantity: 12 }
    ]
  },
  {
    customer_name: "Seed Customer 04",
    customer_phone: "+1 514 555 0104",
    customer_email: "seed04@example.com",
    preferred_language: "en",
    fulfillment_method: "delivery",
    delivery_address: "455 Boulevard Rene-Levesque O, Montreal, QC",
    preferred_datetime: orderDate(54),
    customer_notes: "Office order, include invoice copy.",
    status: "cancelled",
    sent_via: "email",
    items: [{ slug: "festive-pastry-box", quantity: 2 }]
  },
  {
    customer_name: "Seed Customer 05",
    customer_phone: "+1 514 555 0105",
    customer_email: "seed05@example.com",
    preferred_language: "fr",
    fulfillment_method: "pickup",
    preferred_datetime: orderDate(72),
    customer_notes: "Gateau pas trop sucre.",
    status: "completed",
    sent_via: "whatsapp",
    items: [{ slug: "custom-birthday-cake", quantity: 1, custom_notes: "Chocolate, 8 pouces, inscription: Bonne fete Marc." }]
  },
  {
    customer_name: "Seed Customer 06",
    customer_phone: "+1 514 555 0106",
    customer_email: "seed06@example.com",
    preferred_language: "en",
    fulfillment_method: "delivery",
    delivery_address: "88 Avenue Laurier O, Montreal, QC",
    preferred_datetime: orderDate(80),
    customer_notes: "Leave with concierge if customer is unavailable.",
    status: "new",
    sent_via: "whatsapp",
    items: [
      { slug: "macaron-gift-box", quantity: 1 },
      { slug: "chocolate-eclairs", quantity: 10 }
    ]
  },
  {
    customer_name: "Seed Customer 07",
    customer_phone: "+1 514 555 0107",
    customer_email: "seed07@example.com",
    preferred_language: "fr",
    fulfillment_method: "pickup",
    preferred_datetime: orderDate(96),
    customer_notes: "Commande pour evenement familial.",
    status: "confirmed",
    sent_via: "email",
    items: [
      { slug: "festive-pastry-box", quantity: 1 },
      { slug: "mini-fruit-tarts", quantity: 10 },
      { slug: "chocolate-eclairs", quantity: 6 }
    ]
  },
  {
    customer_name: "Seed Customer 08",
    customer_phone: "+1 514 555 0108",
    customer_email: "seed08@example.com",
    preferred_language: "en",
    fulfillment_method: "delivery",
    delivery_address: "32 Rue Wellington, Verdun, QC",
    preferred_datetime: orderDate(110),
    customer_notes: "Please package individually.",
    status: "contacted",
    sent_via: "whatsapp",
    items: [{ slug: "mini-fruit-tarts", quantity: 20 }]
  },
  {
    customer_name: "Seed Customer 09",
    customer_phone: "+1 514 555 0109",
    customer_email: "seed09@example.com",
    preferred_language: "fr",
    fulfillment_method: "pickup",
    preferred_datetime: orderDate(120),
    customer_notes: "Besoin d'une confirmation du prix final.",
    status: "new",
    sent_via: "email",
    items: [
      { slug: "custom-birthday-cake", quantity: 1, custom_notes: "Theme floral, 10 personnes." },
      { slug: "macaron-gift-box", quantity: 1 }
    ]
  },
  {
    customer_name: "Seed Customer 10",
    customer_phone: "+1 514 555 0110",
    customer_email: "seed10@example.com",
    preferred_language: "en",
    fulfillment_method: "delivery",
    delivery_address: "700 Rue de la Gauchetiere O, Montreal, QC",
    preferred_datetime: orderDate(144),
    customer_notes: "Completed sample order for display testing.",
    status: "completed",
    sent_via: "email",
    items: [
      { slug: "festive-pastry-box", quantity: 1 },
      { slug: "macaron-gift-box", quantity: 2 }
    ]
  }
];

let itemCount = 0;
const insertedOrders = [];

for (const template of orderTemplates) {
  const items = template.items.map((item) => {
    const product = findProduct(item.slug);
    const price = unitPrice(product);
    return {
      product_id: product?.id ?? null,
      product_name_snapshot: product?.name_en ?? item.slug,
      product_type_snapshot: product?.product_type ?? "individual",
      quantity: item.quantity,
      unit_price_cents: price,
      line_total_cents: price * item.quantity,
      custom_notes: item.custom_notes ?? null
    };
  });
  const subtotal = items.reduce((total, item) => total + item.line_total_cents, 0);

  const { data: order, error: orderError } = await supabase
    .from("order_requests")
    .insert({
      customer_name: template.customer_name,
      customer_phone: template.customer_phone,
      customer_email: template.customer_email,
      preferred_language: template.preferred_language,
      fulfillment_method: template.fulfillment_method,
      delivery_address: template.delivery_address ?? null,
      preferred_datetime: template.preferred_datetime,
      customer_notes: template.customer_notes,
      subtotal_cents: subtotal,
      currency: "CAD",
      status: template.status,
      sent_via: template.sent_via
    })
    .select("id, customer_name, status")
    .single();

  if (orderError || !order) {
    throw new Error(`Could not insert ${template.customer_name}: ${orderError?.message ?? "unknown error"}`);
  }

  const { error: itemsError } = await supabase.from("order_request_items").insert(
    items.map((item) => ({
      ...item,
      order_request_id: order.id
    }))
  );

  if (itemsError) {
    throw new Error(`Could not insert items for ${template.customer_name}: ${itemsError.message}`);
  }

  itemCount += items.length;
  insertedOrders.push(order);
}

const { count, error: countError } = await supabase
  .from("order_requests")
  .select("id", { count: "exact", head: true })
  .like("customer_name", "Seed Customer%");

if (countError) {
  throw new Error(`Could not count seeded orders: ${countError.message}`);
}

console.log(`Seeded ${insertedOrders.length} orders with ${itemCount} items.`);
console.log(`Seed customer orders now in database: ${count}.`);
console.table(insertedOrders);
