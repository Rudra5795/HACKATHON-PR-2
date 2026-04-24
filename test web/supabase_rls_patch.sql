-- ============================================================
--  FarmDirect – RLS Patch for Farmer Auth
--  Run this in Supabase SQL Editor AFTER the main schema
-- ============================================================

-- 1. Allow authenticated farmers to INSERT products
--    (the main schema policy already checks farmer_id → user_id match)
--    This extra policy allows any auth'd farmer to insert (farmer_id check is in WITH CHECK)
drop policy if exists "Farmers can insert products" on public.products;
create policy "Farmers can insert products"
  on public.products for insert
  with check (
    auth.uid() is not null
    and exists (
      select 1 from public.farmers f
      where f.id = farmer_id
        and f.user_id = auth.uid()
    )
  );

-- 2. Allow profiles to be inserted on signup (service role handles this via trigger,
--    but in case we upsert from client side)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. Allow farmers to insert their own farmer row
drop policy if exists "Farmers can insert own row" on public.farmers;
create policy "Farmers can insert own row"
  on public.farmers for insert
  with check (auth.uid() = user_id);

-- 4. Allow farmers to read their own earnings (even if farmer_id links through user_id)
drop policy if exists "Farmer can read own earnings" on public.earnings;
create policy "Farmer can read own earnings"
  on public.earnings for select
  using (
    exists (
      select 1 from public.farmers f
      where f.id = farmer_id
        and f.user_id = auth.uid()
    )
  );

-- 5. Allow farmers to read orders assigned to them
drop policy if exists "Farmer can see orders assigned to them" on public.orders;
create policy "Farmer can see orders assigned to them"
  on public.orders for select
  using (
    consumer_id = auth.uid()
    or exists (
      select 1 from public.farmers f
      where f.id = farmer_id
        and f.user_id = auth.uid()
    )
  );

-- 6. Allow farmers to read their products (including inactive ones they own)
drop policy if exists "Farmers can read own products" on public.products;
create policy "Farmers can read own products"
  on public.products for select
  using (
    is_active = true
    or exists (
      select 1 from public.farmers f
      where f.id = farmer_id
        and f.user_id = auth.uid()
    )
  );

-- ============================================================
--  DONE! Farmer auth RLS policies updated.
-- ============================================================
