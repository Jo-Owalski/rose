-- Run this once in Supabase SQL Editor for an existing Rose database.

create table if not exists business_settings (
  id text primary key default 'main' check (id = 'main'),
  whatsapp_number text,
  order_email text,
  pickup_instructions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table business_settings enable row level security;

drop policy if exists "Public can read business settings" on business_settings;
create policy "Public can read business settings"
  on business_settings
  for select
  using (id = 'main');

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
on conflict (id) do nothing;
