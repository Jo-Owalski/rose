create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_fr text not null,
  description_en text,
  description_fr text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  slug text unique not null,
  name_en text not null,
  name_fr text not null,
  description_en text,
  description_fr text,
  product_type text not null check (product_type in ('individual', 'bundle', 'custom')),
  price_cents int,
  starting_price_cents int,
  currency text default 'CAD',
  is_available boolean default true,
  is_featured boolean default false,
  is_seasonal boolean default false,
  is_hidden boolean default false,
  preparation_lead_time_hours int default 24,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  alt_text_en text,
  alt_text_fr text,
  is_primary boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_product_id uuid references products(id) on delete cascade,
  included_product_id uuid references products(id) on delete restrict,
  quantity int not null default 1,
  created_at timestamptz default now(),
  constraint bundle_not_self check (bundle_product_id <> included_product_id)
);

create table order_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text,
  customer_email text,
  preferred_language text not null check (preferred_language in ('en', 'fr')),
  fulfillment_method text not null check (fulfillment_method in ('pickup', 'delivery')),
  delivery_address text,
  preferred_datetime timestamptz,
  customer_notes text,
  subtotal_cents int,
  currency text default 'CAD',
  status text default 'new' check (status in ('new', 'contacted', 'confirmed', 'cancelled', 'completed')),
  sent_via text check (sent_via in ('whatsapp', 'email')),
  final_total_cents int,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  admin_notes text,
  fulfillment_notes text,
  confirmed_at timestamptz,
  created_at timestamptz default now()
);

create table order_request_items (
  id uuid primary key default gen_random_uuid(),
  order_request_id uuid references order_requests(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name_snapshot text not null,
  product_type_snapshot text not null,
  quantity int not null,
  unit_price_cents int,
  line_total_cents int,
  custom_notes text,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz default now()
);

create table business_settings (
  id text primary key default 'main' check (id = 'main'),
  whatsapp_number text,
  order_email text,
  pickup_instructions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table social_posts (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('instagram', 'tiktok')),
  post_url text not null,
  image_url text not null,
  title_en text not null,
  title_fr text not null,
  caption_en text,
  caption_fr text,
  sort_order int default 0,
  is_visible boolean default true,
  source_post_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table bundle_items enable row level security;
alter table order_requests enable row level security;
alter table order_request_items enable row level security;
alter table profiles enable row level security;
alter table business_settings enable row level security;
alter table social_posts enable row level security;

create policy "Public can read active categories" on categories for select using (is_active = true);
create policy "Public can read visible products" on products for select using (is_hidden = false);
create policy "Public can read product images" on product_images for select using (true);
create policy "Public can read visible social posts" on social_posts for select using (is_visible = true);
create policy "Public can read business settings" on business_settings for select using (id = 'main');
create policy "Public can create order requests" on order_requests for insert with check (true);
create policy "Public can create order request items" on order_request_items for insert with check (true);
