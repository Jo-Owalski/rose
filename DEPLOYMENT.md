# Rose Deployment Checklist

## Supabase

Run SQL files in this order for a new project:

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/storage.sql`
4. `supabase/order-workflow.sql`

For an existing project, run only the missing migration files:

- `supabase/business-settings.sql`
- `supabase/storage.sql`
- `supabase/order-workflow.sql`

## Environment Variables

Set these locally and in production:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.

## Admin User

1. Create the admin user in Supabase Auth.
2. Promote the user locally:

```bash
npm run promote:admin -- admin@example.com
```

## Verification

Run:

```bash
npm run healthcheck
npm run test:business-settings
npm run test:admin-crud
npm run build
```

## Production Notes

- The public admin link is hidden from the storefront navigation.
- `/[locale]/admin` is protected by Supabase Auth and `profiles.role = admin`.
- Admin image uploads use the public `rose-media` storage bucket.
- Orders can be exported from `/api/admin/orders/export` only by authenticated admins.
