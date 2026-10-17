-- NEXORA PREMIUM backend setup (Supabase SQL Editor)
-- 1) Ganti andrearshavinkece73@gmail.com di semua policy dengan EMAIL akun admin Supabase Auth.
-- 2) Buat akun admin di Authentication > Users terlebih dahulu.
-- 3) Jalankan SQL ini di Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'DIGITAL / PREMIUM',
  description text not null default '',
  icon text not null default '✦',
  image_url text,
  price integer not null default 0 check (price >= 0),
  old_price integer not null default 0 check (old_price >= 0),
  discount integer not null default 0 check (discount >= 0 and discount <= 100),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_admin text not null default '',
  hero_image_url text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
for select to anon, authenticated using (active = true or (auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com'));

drop policy if exists "Admin can insert products" on public.products;
create policy "Admin can insert products" on public.products
for insert to authenticated with check (auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com');

drop policy if exists "Admin can update products" on public.products;
create policy "Admin can update products" on public.products
for update to authenticated using (auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com')
with check (auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com');

drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products" on public.products
for delete to authenticated using (auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com');

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
for select to anon, authenticated using (true);

drop policy if exists "Admin can update site settings" on public.site_settings;
create policy "Admin can update site settings" on public.site_settings
for update to authenticated using (auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com')
with check (auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com');

-- Image bucket: public reads images; only the designated admin can upload/change/delete.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'product-images' and auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com'
);

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images" on storage.objects
for update to authenticated using (
  bucket_id = 'product-images' and auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com'
) with check (
  bucket_id = 'product-images' and auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com'
);

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images" on storage.objects
for delete to authenticated using (
  bucket_id = 'product-images' and auth.jwt()->>'email' = 'andrearshavinkece73@gmail.com'
);

-- Starter catalog. Edit prices/stock from admin after first login.
insert into public.products (name, category, description, icon, price, old_price, discount, stock, active, sort_order)
select * from (values
 ('Canva Pro','DESIGN / 001','Desain tanpa batas untuk ide yang lebih besar.','C',25000,30000,17,12,true,1),
 ('CapCut Pro','VIDEO / 002','Edit video dengan fitur kreatif tambahan.','⌁',20000,25000,20,8,true,2),
 ('Alight Motion','MOTION / 003','Animasi, motion design, dan efek untuk karyamu.','A',18000,0,0,5,true,3),
 ('Spotify Premium','AUDIO / 004','Nikmati pengalaman mendengarkan musik yang nyaman.','≋',15000,0,0,10,true,4)
) as v(name,category,description,icon,price,old_price,discount,stock,active,sort_order)
where not exists (select 1 from public.products);
