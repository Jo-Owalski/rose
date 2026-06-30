# Rose Supabase Setup

Run these files in order:

1. `schema.sql`
2. `seed.sql`

For an existing database created before business settings were added, run `business-settings.sql` once in the Supabase SQL Editor instead of rerunning the full schema.

Run `storage.sql` once to create the public `rose-media` bucket used by admin image uploads.

Run `order-workflow.sql` once to add final price, payment status, admin notes, fulfillment notes, and confirmation timestamp to order requests.

Use `npm run healthcheck` after setup to verify env vars, core tables, business settings, storage, order workflow columns, and at least one admin profile.

Then create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The seed file creates the MVP catalog data from the local storefront:

- categories
- products
- primary product images
- a sample bundle composition

It intentionally does not seed Instagram/TikTok posts. Add `social_posts` rows only when the media URL and post URL come from the official business accounts.

Current app behavior:

- If Supabase env vars are missing, public pages fall back to local demo data.
- If Supabase env vars are present, menu/category/product/social reads use Supabase.
- Checkout posts to `/api/order-requests`; without env vars it returns `saved: false` and still lets WhatsApp/email open.
- With env vars, checkout inserts into `order_requests` and `order_request_items` before opening WhatsApp/email.
- Checkout reads WhatsApp, email, and pickup instructions from `business_settings`.
- Admin Settings updates `business_settings` through a protected server action.
