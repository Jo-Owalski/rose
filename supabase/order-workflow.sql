-- Run once for existing Rose databases to add admin workflow fields to order requests.

alter table order_requests
  add column if not exists final_total_cents int,
  add column if not exists payment_status text default 'pending'
    check (payment_status in ('pending', 'paid', 'refunded')),
  add column if not exists admin_notes text,
  add column if not exists fulfillment_notes text,
  add column if not exists confirmed_at timestamptz;
