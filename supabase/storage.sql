-- Run this once in Supabase SQL Editor to enable admin image uploads.
-- The app uploads through the service role and stores public URLs in catalog/social tables.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'rose-media',
  'rose-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read rose media" on storage.objects;
create policy "Public can read rose media"
  on storage.objects
  for select
  using (bucket_id = 'rose-media');
