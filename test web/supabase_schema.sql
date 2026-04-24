-- ============================================================
--  FarmDirect – Supabase Database Schema
--  Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────
--  1. EXTENSIONS
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
--  2. ENUM TYPES
-- ─────────────────────────────────────────────
do $$ begin
  create type order_status as enum ('placed','packed','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('upi','cod','card','netbanking');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────
--  3. PROFILES  (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  full_name_hi  text,
  phone         text,
  role          text check (role in ('consumer','farmer')) default 'consumer',
  avatar_url    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ─────────────────────────────────────────────
--  4. CATEGORIES
-- ─────────────────────────────────────────────
create table if not exists public.categories (
  id          serial primary key,
  name        text not null unique,
  name_hi     text,
  icon        text,
  color       text,
  accent      text,
  count       integer default 0
);

alter table public.categories enable row level security;

create policy "Anyone can read categories"
  on public.categories for select using (true);

-- Seed data
insert into public.categories (name, name_hi, icon, color, accent, count) values
  ('Fruits',     'फल',          '🍎', '#FEE2E2', '#EF4444', 48),
  ('Vegetables', 'सब्ज़ियाँ',   '🥬', '#DCFCE7', '#16A34A', 62),
  ('Dairy',      'डेयरी',       '🥛', '#FEF9C3', '#F59E0B', 24),
  ('Grains',     'अनाज',        '🌾', '#FED7AA', '#EA580C', 35),
  ('Spices',     'मसाले',       '🌶️','#FECACA', '#DC2626', 29),
  ('Herbs',      'जड़ी बूटी',   '🌿', '#D1FAE5', '#059669', 18)
on conflict (name) do nothing;

-- ─────────────────────────────────────────────
--  5. FARMERS
-- ─────────────────────────────────────────────
create table if not exists public.farmers (
  id            serial primary key,
  user_id       uuid references public.profiles(id) on delete set null,
  name          text not null,
  name_hi       text,
  location      text,
  location_hi   text,
  rating        numeric(3,1) default 0,
  reviews       integer default 0,
  products      integer default 0,
  image_url     text,
  verified      boolean default false,
  since         integer,                -- year they joined
  specialty     text,
  created_at    timestamptz default now()
);

alter table public.farmers enable row level security;

create policy "Anyone can read farmers"
  on public.farmers for select using (true);

create policy "Farmer can update own record"
  on public.farmers for update using (auth.uid() = user_id);

-- Seed data
insert into public.farmers (name, name_hi, location, location_hi, rating, reviews, products, verified, since, specialty) values
  ('Ramesh Patel',  'रमेश पटेल',  'Nashik, Maharashtra',  'नाशिक, महाराष्ट्र',  4.8, 234, 18, true,  2019, 'Organic Vegetables'),
  ('Sunita Devi',   'सुनीता देवी','Shimla, Himachal',      'शिमला, हिमाचल',       4.9, 189, 12, true,  2020, 'Apples & Fruits'),
  ('Arjun Singh',   'अर्जुन सिंह','Amritsar, Punjab',       'अमृतसर, पंजाब',       4.7, 312, 25, true,  2018, 'Wheat & Grains'),
  ('Lakshmi Bai',   'लक्ष्मी बाई','Anand, Gujarat',         'आनंद, गुजरात',        4.9, 156,  8, true,  2021, 'Fresh Dairy'),
  ('Kiran Kumar',   'किरण कुमार', 'Raichur, Karnataka',    'रायचूर, कर्नाटक',     4.6,  98, 15, false, 2022, 'Rice & Millets'),
  ('Meena Kumari',  'मीना कुमारी','Jaipur, Rajasthan',      'जयपुर, राजस्थान',     4.8, 201, 20, true,  2020, 'Spices & Herbs')
on conflict do nothing;

-- ─────────────────────────────────────────────
--  6. PRODUCTS
-- ─────────────────────────────────────────────
create table if not exists public.products (
  id              serial primary key,
  name            text not null,
  name_hi         text,
  category        text references public.categories(name) on update cascade,
  price           numeric(10,2) not null,
  market_price    numeric(10,2),
  unit            text default 'kg',
  farmer_id       integer references public.farmers(id) on delete set null,
  freshness       timestamptz,           -- harvest timestamp
  badge           text,
  badge_hi        text,
  rating          numeric(3,1) default 0,
  reviews         integer default 0,
  stock           integer default 0,
  description     text,
  description_hi  text,
  emoji           text,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.products enable row level security;

create policy "Anyone can read active products"
  on public.products for select using (is_active = true);

create policy "Farmers can insert products"
  on public.products for insert
  with check (
    exists (select 1 from public.farmers f where f.id = farmer_id and f.user_id = auth.uid())
  );

create policy "Farmers can update own products"
  on public.products for update
  using (
    exists (select 1 from public.farmers f where f.id = farmer_id and f.user_id = auth.uid())
  );

-- Seed data (freshness = now minus X hours)
insert into public.products
  (name, name_hi, category, price, market_price, unit, farmer_id, freshness, badge, badge_hi, rating, reviews, stock, description, description_hi, emoji)
values
  ('Organic Tomatoes',  'जैविक टमाटर',    'Vegetables', 40,  60,  'kg',    1, now() - interval '3 hours',  'Organic',     'जैविक',        4.7, 89,  50, 'Farm-fresh organic tomatoes, grown without pesticides.', 'खेत से ताज़े जैविक टमाटर।', '🍅'),
  ('Fresh Spinach',     'ताज़ा पालक',      'Vegetables', 30,  45,  'bunch', 1, now() - interval '2 hours',  'Fresh',       'ताज़ा',         4.8, 67,  30, 'Crisp, green spinach leaves packed with iron.',          'आयरन से भरपूर पालक।',       '🥬'),
  ('Alphonso Mangoes',  'अल्फांसो आम',     'Fruits',    350, 500, 'dozen', 2, now() - interval '8 hours',  'Premium',     'प्रीमियम',      4.9,156,  20, 'Premium Alphonso mangoes from Ratnagiri.',               'रत्नागिरी के अल्फांसो आम।', '🥭'),
  ('Basmati Rice',      'बासमती चावल',    'Grains',    120, 180, 'kg',    3, now() - interval '48 hours', 'Staple',      'मूल',           4.6,203, 100, 'Long-grain premium basmati rice.',                       'प्रीमियम बासमती चावल।',     '🍚'),
  ('Farm Milk',         'फार्म दूध',       'Dairy',      60,  80,  'litre', 4, now() - interval '1 hour',   'Fresh',       'ताज़ा',         4.9,134,  40, 'Pure A2 cow milk delivered fresh every morning.',        'शुद्ध A2 गाय का दूध।',      '🥛'),
  ('Organic Carrots',   'जैविक गाजर',     'Vegetables', 45,  65,  'kg',    1, now() - interval '5 hours',  'Organic',     'जैविक',        4.5, 56,  35, 'Bright orange organic carrots, crunchy and sweet.',      'जैविक गाजर।',               '🥕'),
  ('Wheat Flour',       'गेहूं का आटा',   'Grains',     55,  75,  'kg',    3, now() - interval '24 hours', 'Fresh Ground','ताज़ा पिसा',    4.7,178,  80, 'Stone-ground whole wheat flour from Punjab.',             'पत्थर पर पिसा गेहूं आटा।',  '🌾'),
  ('Paneer',            'पनीर',            'Dairy',     280, 360, 'kg',    4, now() - interval '4 hours',  'Homemade',    'घर का बना',     4.8, 92,  15, 'Soft, fresh homemade paneer, no preservatives.',         'घर का बना ताज़ा पनीर।',     '🧀'),
  ('Red Onions',        'लाल प्याज़',      'Vegetables', 35,  50,  'kg',    6, now() - interval '6 hours',  'Farm Fresh',  'खेत से ताज़ा', 4.4,145,  60, 'Premium Nashik red onions.',                              'नाशिक लाल प्याज़।',          '🧅'),
  ('Green Chillies',    'हरी मिर्च',       'Spices',     20,  35,  '250g',  6, now() - interval '2 hours',  'Spicy',       'तीखा',          4.6, 73,  45, 'Fresh green chillies with the perfect kick.',             'ताज़ी हरी मिर्च।',           '🌶️'),
  ('Fresh Coriander',   'ताज़ा धनिया',    'Herbs',      15,  25,  'bunch', 6, now() - interval '1 hour',   'Aromatic',    'सुगंधित',       4.7, 88,  50, 'Fragrant coriander leaves for garnishing.',              'सुगंधित धनिया।',             '🌿'),
  ('Shimla Apples',     'शिमला सेब',      'Fruits',    180, 250, 'kg',    2, now() - interval '12 hours', 'Himalayan',   'हिमालयी',       4.8,167,  25, 'Crisp, juicy apples from Shimla orchards.',              'शिमला के रसीले सेब।',       '🍎')
on conflict do nothing;

-- ─────────────────────────────────────────────
--  7. ADDRESSES
-- ─────────────────────────────────────────────
create table if not exists public.addresses (
  id           serial primary key,
  user_id      uuid references public.profiles(id) on delete cascade,
  type         text default 'Home',
  type_hi      text,
  address_line text not null,
  city         text,
  pincode      text,
  is_default   boolean default false,
  created_at   timestamptz default now()
);

alter table public.addresses enable row level security;

create policy "Users can manage their own addresses"
  on public.addresses for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
--  8. ORDERS
-- ─────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default uuid_generate_v4(),
  consumer_id      uuid references public.profiles(id) on delete set null,
  address_id       integer references public.addresses(id) on delete set null,
  payment_method   payment_method default 'upi',
  subtotal         numeric(10,2) not null,
  delivery_fee     numeric(10,2) default 0,
  total            numeric(10,2) not null,
  status           order_status default 'placed',
  farmer_id        integer references public.farmers(id) on delete set null,
  placed_at        timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Consumer can see own orders"
  on public.orders for select using (auth.uid() = consumer_id);

create policy "Consumer can place orders"
  on public.orders for insert with check (auth.uid() = consumer_id);

create policy "Farmer can see orders assigned to them"
  on public.orders for select
  using (
    exists (select 1 from public.farmers f where f.id = farmer_id and f.user_id = auth.uid())
  );

create policy "Farmer can update order status"
  on public.orders for update
  using (
    exists (select 1 from public.farmers f where f.id = farmer_id and f.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
--  9. ORDER ITEMS
-- ─────────────────────────────────────────────
create table if not exists public.order_items (
  id          serial primary key,
  order_id    uuid references public.orders(id) on delete cascade,
  product_id  integer references public.products(id) on delete set null,
  name        text,                  -- snapshot of product name at time of order
  price       numeric(10,2) not null,
  qty         integer not null,
  unit        text,
  emoji       text
);

alter table public.order_items enable row level security;

create policy "Users can read items of their own orders"
  on public.order_items for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.consumer_id = auth.uid())
  );

create policy "System can insert order items"
  on public.order_items for insert with check (true);

-- ─────────────────────────────────────────────
--  10. ORDER TRACKING STEPS
-- ─────────────────────────────────────────────
create table if not exists public.order_tracking (
  id         serial primary key,
  order_id   uuid references public.orders(id) on delete cascade,
  status     order_status not null,
  label      text,
  label_hi   text,
  detail     text,
  detail_hi  text,
  step_time  text,
  done       boolean default false,
  created_at timestamptz default now()
);

alter table public.order_tracking enable row level security;

create policy "Users can read tracking of own orders"
  on public.order_tracking for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.consumer_id = auth.uid())
  );

-- ─────────────────────────────────────────────
--  11. CART  (optional persistent cart)
-- ─────────────────────────────────────────────
create table if not exists public.cart_items (
  id          serial primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  product_id  integer references public.products(id) on delete cascade,
  qty         integer default 1,
  added_at    timestamptz default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "Users can manage their own cart"
  on public.cart_items for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
--  12. EARNINGS  (farmer earnings summary)
-- ─────────────────────────────────────────────
create table if not exists public.earnings (
  id          serial primary key,
  farmer_id   integer references public.farmers(id) on delete cascade unique,
  today       numeric(10,2) default 0,
  this_week   numeric(10,2) default 0,
  this_month  numeric(10,2) default 0,
  pending     numeric(10,2) default 0,
  updated_at  timestamptz default now()
);

alter table public.earnings enable row level security;

create policy "Farmer can read own earnings"
  on public.earnings for select
  using (
    exists (select 1 from public.farmers f where f.id = farmer_id and f.user_id = auth.uid())
  );

-- Seed earnings for Ramesh Patel (farmer_id = 1)
insert into public.earnings (farmer_id, today, this_week, this_month, pending)
values (1, 1240, 8450, 32600, 2100)
on conflict (farmer_id) do nothing;

-- ─────────────────────────────────────────────
--  13. QUICK FILTERS  (lookup table)
-- ─────────────────────────────────────────────
create table if not exists public.quick_filters (
  id        text primary key,
  label     text not null,
  label_hi  text
);

insert into public.quick_filters (id, label, label_hi) values
  ('all',        'All',          'सभी'),
  ('organic',    'Organic',      'जैविक'),
  ('seasonal',   'Seasonal',     'मौसमी'),
  ('under50',    'Under ₹50',    '₹50 से कम'),
  ('bestseller', 'Bestseller',   'बेस्टसेलर'),
  ('new',        'New Arrivals', 'नई उपलब्धता')
on conflict (id) do nothing;

alter table public.quick_filters enable row level security;

create policy "Anyone can read quick filters"
  on public.quick_filters for select using (true);

-- ─────────────────────────────────────────────
--  14. HELPER FUNCTION – auto-update timestamps
-- ─────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

create or replace trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────
--  15. REALTIME  (enable realtime for key tables)
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_tracking;
alter publication supabase_realtime add table public.cart_items;

-- ============================================================
--  DONE! All FarmDirect tables created and seeded.
-- ============================================================
