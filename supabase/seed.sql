-- Rose MVP seed data.
-- Run after supabase/schema.sql.
-- This file is safe to rerun: categories/products are upserted, seeded images/bundles are refreshed.

insert into business_settings (
  id,
  whatsapp_number,
  order_email,
  pickup_instructions
)
values (
  'main',
  '15140000000',
  'orders@example.com',
  ''
)
on conflict (id) do update set
  whatsapp_number = excluded.whatsapp_number,
  order_email = excluded.order_email,
  pickup_instructions = excluded.pickup_instructions,
  updated_at = now();

insert into categories (
  slug,
  name_en,
  name_fr,
  description_en,
  description_fr,
  sort_order,
  is_active
)
values
  (
    'bakeries',
    'Bakeries',
    'Boulangerie',
    'Fresh breads, rolls, and everyday bakery staples.',
    'Pains frais, petits pains et essentiels de boulangerie.',
    1,
    true
  ),
  (
    'pastries',
    'Pastries',
    'Patisseries',
    'Croissants, rolls, tarts, and sweet pastry favorites.',
    'Croissants, brioches, tartelettes et douceurs favorites.',
    2,
    true
  ),
  (
    'cakes',
    'Cakes',
    'Gateaux',
    'Birthday cakes, custom cakes, and celebration orders.',
    'Gateaux d''anniversaire, gateaux personnalises et celebrations.',
    3,
    true
  ),
  (
    'bundles',
    'Bundles / packs',
    'Boites / ensembles',
    'Curated pastry boxes and group packs for events.',
    'Boites de patisseries et ensembles pour evenements.',
    4,
    true
  ),
  (
    'african-food',
    'Future African food',
    'Cuisine africaine a venir',
    'Future warm food offers inspired by African kitchens.',
    'Futures offres chaudes inspirees des cuisines africaines.',
    5,
    true
  ),
  (
    'european-food',
    'Future European food',
    'Cuisine europeenne a venir',
    'Future savory European food and catering additions.',
    'Futures additions salees europeennes et traiteur.',
    6,
    true
  )
on conflict (slug) do update set
  name_en = excluded.name_en,
  name_fr = excluded.name_fr,
  description_en = excluded.description_en,
  description_fr = excluded.description_fr,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into products (
  category_id,
  slug,
  name_en,
  name_fr,
  description_en,
  description_fr,
  product_type,
  price_cents,
  starting_price_cents,
  currency,
  is_available,
  is_featured,
  is_seasonal,
  is_hidden,
  preparation_lead_time_hours,
  sort_order
)
values
  (
    (select id from categories where slug = 'pastries'),
    'butter-croissants',
    'Butter croissants',
    'Croissants au beurre',
    'Flaky, golden croissants baked in small batches.',
    'Croissants feuilletes et dores, cuits en petites fournees.',
    'individual',
    450,
    null,
    'CAD',
    true,
    true,
    false,
    false,
    12,
    1
  ),
  (
    (select id from categories where slug = 'cakes'),
    'birthday-cake',
    'Custom birthday cake',
    'Gateau d''anniversaire personnalise',
    'Made-to-order celebration cake with flavor, size, message, and decoration notes.',
    'Gateau de celebration sur mesure avec saveur, taille, message et decoration.',
    'custom',
    null,
    6500,
    'CAD',
    true,
    true,
    false,
    false,
    48,
    2
  ),
  (
    (select id from categories where slug = 'bundles'),
    'pastry-party-box',
    'Pastry party box',
    'Boite de patisseries festives',
    'A dozen assorted pastries for brunches, birthdays, and office treats.',
    'Douze patisseries assorties pour brunchs, anniversaires et bureaux.',
    'bundle',
    4000,
    null,
    'CAD',
    true,
    true,
    true,
    false,
    24,
    3
  ),
  (
    (select id from categories where slug = 'bakeries'),
    'country-sourdough',
    'Country sourdough',
    'Pain au levain de campagne',
    'Crusty sourdough loaf with a soft tangy crumb.',
    'Pain au levain croustillant avec mie douce et legerement acidulee.',
    'individual',
    900,
    null,
    'CAD',
    true,
    false,
    false,
    false,
    18,
    4
  ),
  (
    (select id from categories where slug = 'pastries'),
    'mini-fruit-tarts',
    'Mini fruit tarts',
    'Mini tartelettes aux fruits',
    'Shortcrust shells, pastry cream, and seasonal fruit.',
    'Pate sablee, creme patissiere et fruits de saison.',
    'individual',
    550,
    null,
    'CAD',
    true,
    false,
    false,
    false,
    12,
    5
  ),
  (
    (select id from categories where slug = 'european-food'),
    'future-savory-box',
    'Future savory box',
    'Future boite salee',
    'A future catering-style food box for savory events.',
    'Une future boite de type traiteur pour evenements sales.',
    'bundle',
    5200,
    null,
    'CAD',
    false,
    false,
    false,
    false,
    36,
    6
  )
on conflict (slug) do update set
  category_id = excluded.category_id,
  name_en = excluded.name_en,
  name_fr = excluded.name_fr,
  description_en = excluded.description_en,
  description_fr = excluded.description_fr,
  product_type = excluded.product_type,
  price_cents = excluded.price_cents,
  starting_price_cents = excluded.starting_price_cents,
  currency = excluded.currency,
  is_available = excluded.is_available,
  is_featured = excluded.is_featured,
  is_seasonal = excluded.is_seasonal,
  is_hidden = excluded.is_hidden,
  preparation_lead_time_hours = excluded.preparation_lead_time_hours,
  sort_order = excluded.sort_order,
  updated_at = now();

delete from product_images
where product_id in (
  select id from products
  where slug in (
    'butter-croissants',
    'birthday-cake',
    'pastry-party-box',
    'country-sourdough',
    'mini-fruit-tarts',
    'future-savory-box'
  )
);

insert into product_images (
  product_id,
  image_url,
  alt_text_en,
  alt_text_fr,
  is_primary,
  sort_order
)
values
  (
    (select id from products where slug = 'butter-croissants'),
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
    'Golden butter croissants',
    'Croissants au beurre dores',
    true,
    1
  ),
  (
    (select id from products where slug = 'birthday-cake'),
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80',
    'Custom celebration cake',
    'Gateau de celebration personnalise',
    true,
    1
  ),
  (
    (select id from products where slug = 'pastry-party-box'),
    'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80',
    'Assorted pastry party box',
    'Boite de patisseries assorties',
    true,
    1
  ),
  (
    (select id from products where slug = 'country-sourdough'),
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    'Country sourdough loaf',
    'Pain au levain de campagne',
    true,
    1
  ),
  (
    (select id from products where slug = 'mini-fruit-tarts'),
    'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=80',
    'Mini fruit tarts',
    'Mini tartelettes aux fruits',
    true,
    1
  ),
  (
    (select id from products where slug = 'future-savory-box'),
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
    'Savory catering food box preview',
    'Apercu de boite salee traiteur',
    true,
    1
  );

delete from bundle_items
where bundle_product_id = (select id from products where slug = 'pastry-party-box');

insert into bundle_items (
  bundle_product_id,
  included_product_id,
  quantity
)
values
  (
    (select id from products where slug = 'pastry-party-box'),
    (select id from products where slug = 'butter-croissants'),
    4
  ),
  (
    (select id from products where slug = 'pastry-party-box'),
    (select id from products where slug = 'mini-fruit-tarts'),
    4
  );

-- Real Instagram/TikTok posts belong in social_posts.
-- Do not seed stock images here. Add rows only when image_url/post_url come from official social accounts.
