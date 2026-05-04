-- ─── Supabase Storage: product-images bucket ───────────────────────────────
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create bucket (public so product images are visible to all shoppers)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Allow authenticated farmers to upload their own product images
create policy "Farmers can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

-- 3. Allow anyone to view product images (public shop display)
create policy "Anyone can view product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

-- 4. Allow farmers to update/replace their own images
create policy "Farmers can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

-- 5. Allow farmers to delete their own images
create policy "Farmers can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

-- 6. Add image_url column to products table if it doesn't exist
alter table products
  add column if not exists image_url text;
