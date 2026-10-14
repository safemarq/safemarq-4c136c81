-- Makes, workshop equipment and the blog.
-- * makes / tool_brands mirror src/lib/makes.ts and src/lib/equipment.ts
--   (regenerate the seed with: node --experimental-strip-types scripts/gen-sql.mjs brands).
-- * garage_makes / garage_tool_brands: what each establishment services and works with.
--   The owner fills them in; only SafeMarq can mark an official dealership.
-- * posts: blog articles, written in the admin area, public once published.
-- * search_garages gains a make and an equipment filter.

-- ---------------------------------------------------------------------------
-- Reference lists
-- ---------------------------------------------------------------------------
create table if not exists public.makes (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  vehicles text[] not null default '{}'
);

create table if not exists public.tool_brands (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  kinds text[] not null default '{}'
);

alter table public.makes enable row level security;
alter table public.tool_brands enable row level security;
drop policy if exists "Makes are public" on public.makes;
create policy "Makes are public" on public.makes for select to anon, authenticated using (true);
drop policy if exists "Tool brands are public" on public.tool_brands;
create policy "Tool brands are public" on public.tool_brands for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- What each establishment services / works with
-- ---------------------------------------------------------------------------
create table if not exists public.garage_makes (
  garage_id uuid not null references public.garages(id) on delete cascade,
  make text not null references public.makes(slug) on update cascade on delete cascade,
  -- Official dealer or approved repairer of the make: checked by SafeMarq.
  official boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (garage_id, make)
);
create index if not exists garage_makes_make_idx on public.garage_makes (make, garage_id);

create table if not exists public.garage_tool_brands (
  garage_id uuid not null references public.garages(id) on delete cascade,
  brand text not null references public.tool_brands(slug) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  primary key (garage_id, brand)
);
create index if not exists garage_tool_brands_brand_idx on public.garage_tool_brands (brand, garage_id);

alter table public.garage_makes enable row level security;
alter table public.garage_tool_brands enable row level security;

drop policy if exists "Garage makes are public" on public.garage_makes;
create policy "Garage makes are public" on public.garage_makes for select to anon, authenticated using (true);
drop policy if exists "Owners and admins manage garage makes" on public.garage_makes;
create policy "Owners and admins manage garage makes" on public.garage_makes
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin')
         or exists (select 1 from public.garage_owners o where o.garage_id = garage_makes.garage_id and o.user_id = auth.uid()))
  with check (public.has_role(auth.uid(), 'admin')
         or exists (select 1 from public.garage_owners o where o.garage_id = garage_makes.garage_id and o.user_id = auth.uid()));

drop policy if exists "Garage equipment is public" on public.garage_tool_brands;
create policy "Garage equipment is public" on public.garage_tool_brands for select to anon, authenticated using (true);
drop policy if exists "Owners and admins manage garage equipment" on public.garage_tool_brands;
create policy "Owners and admins manage garage equipment" on public.garage_tool_brands
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin')
         or exists (select 1 from public.garage_owners o where o.garage_id = garage_tool_brands.garage_id and o.user_id = auth.uid()))
  with check (public.has_role(auth.uid(), 'admin')
         or exists (select 1 from public.garage_owners o where o.garage_id = garage_tool_brands.garage_id and o.user_id = auth.uid()));

-- "Official dealer" is a claim SafeMarq checks, so owners cannot set it.
create or replace function public.guard_garage_make()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.official := false;
  else
    new.official := old.official;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_garage_make on public.garage_makes;
create trigger guard_garage_make
  before insert or update on public.garage_makes
  for each row execute function public.guard_garage_make();

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  locale text not null default 'fr' check (locale in ('fr', 'nl', 'de', 'en')),
  title text not null check (char_length(title) between 3 and 140),
  excerpt text not null default '' check (char_length(excerpt) <= 320),
  body text not null default '' check (char_length(body) <= 60000),
  category text not null default 'guide' check (category in ('guide', 'conseil', 'actualite')),
  -- Unsplash photo id ("photo-…"): the site serves it through its image helper.
  cover_photo text check (cover_photo is null or cover_photo ~ '^photo-[0-9a-z-]{10,60}$'),
  cover_alt text check (cover_alt is null or char_length(cover_alt) <= 200),
  cover_credit text check (cover_credit is null or char_length(cover_credit) <= 120),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale, slug)
);
create index if not exists posts_listing_idx on public.posts (locale, status, published_at desc);

alter table public.posts enable row level security;
drop policy if exists "Published posts are public" on public.posts;
create policy "Published posts are public" on public.posts
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());
drop policy if exists "Admins manage posts" on public.posts;
create policy "Admins manage posts" on public.posts
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.stamp_post()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if tg_op = 'INSERT' and new.author_id is null then
    new.author_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_post on public.posts;
create trigger stamp_post
  before insert or update on public.posts
  for each row execute function public.stamp_post();

-- ---------------------------------------------------------------------------
-- Search: optional make and equipment filters; vehicle can be left open.
-- ---------------------------------------------------------------------------
drop function if exists public.search_garages(double precision, double precision, text, text, integer, text, integer, integer, boolean);

create or replace function public.search_garages(
  p_lat double precision,
  p_lng double precision,
  p_vehicle text default 'voiture',
  p_trade text default null,
  p_radius_km integer default 15,
  p_sort text default 'score',
  p_limit integer default 30,
  p_offset integer default 0,
  p_verified_only boolean default false,
  p_make text default null,
  p_tool text default null
)
returns table (
  id uuid, slug text, name text, type text, brand text, rating numeric, reviews_count integer,
  verified boolean, address text, locality text, postal_code text, logo_url text, cover_image_url text,
  tier garage_tier, safemarq_score smallint, lat double precision, lng double precision,
  location_precise boolean, distance_km numeric, official boolean, total_count bigint
)
language sql
stable
set search_path = public, extensions
as $$
  with origin as (
    select st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography as g
     where p_lat between 49.4 and 51.6 and p_lng between 2.4 and 6.5
  ),
  hits as (
    select g.id, g.slug, g.name, g.type, g.brand, g.rating, g.reviews_count, g.verified, g.address,
           g.locality, g.postal_code, g.logo_url, g.cover_image_url, g.tier, g.safemarq_score,
           st_y(g.location::geometry) as lat, st_x(g.location::geometry) as lng, g.location_precise,
           st_distance(g.location, o.g) as dist_m,
           coalesce(gm.official, false) as official
      from public.garages g
      cross join origin o
      left join public.garage_makes gm on gm.garage_id = g.id and gm.make = p_make
     where g.location is not null
       and st_dwithin(g.location, o.g, least(greatest(coalesce(p_radius_km, 15), 1), 100) * 1000.0)
       and (not coalesce(p_verified_only, false) or g.verified)
       and ((p_vehicle is null and p_trade is null) or exists (
         select 1 from public.garage_services s
          where s.garage_id = g.id
            and (p_vehicle is null or s.vehicle = p_vehicle)
            and (p_trade is null or s.trade = p_trade)
       ))
       and (p_make is null or gm.garage_id is not null)
       and (p_tool is null or exists (
         select 1 from public.garage_tool_brands t where t.garage_id = g.id and t.brand = p_tool
       ))
  )
  select h.id, h.slug, h.name, h.type, h.brand, h.rating, h.reviews_count, h.verified, h.address,
         h.locality, h.postal_code, h.logo_url, h.cover_image_url, h.tier, h.safemarq_score,
         h.lat, h.lng, h.location_precise,
         round((h.dist_m / 1000)::numeric, 1) as distance_km,
         h.official,
         count(*) over () as total_count
    from hits h
   order by
     case when p_sort = 'distance' then h.dist_m end asc,
     h.safemarq_score desc,
     h.reviews_count desc,
     h.dist_m asc
   limit least(greatest(coalesce(p_limit, 30), 1), 50)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

grant execute on function public.search_garages(double precision, double precision, text, text, integer, text, integer, integer, boolean, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed of the reference lists
-- ---------------------------------------------------------------------------
insert into public.makes (slug, name, vehicles) values
  ('abarth', 'Abarth', array['voiture']::text[]),
  ('alfa-romeo', 'Alfa Romeo', array['voiture']::text[]),
  ('alpine', 'Alpine', array['voiture']::text[]),
  ('aston-martin', 'Aston Martin', array['voiture']::text[]),
  ('audi', 'Audi', array['voiture']::text[]),
  ('bentley', 'Bentley', array['voiture']::text[]),
  ('bmw', 'BMW', array['voiture', 'moto']::text[]),
  ('byd', 'BYD', array['voiture']::text[]),
  ('citroen', 'Citroën', array['voiture', 'utilitaire', 'camping-car']::text[]),
  ('cupra', 'Cupra', array['voiture']::text[]),
  ('dacia', 'Dacia', array['voiture']::text[]),
  ('ds', 'DS', array['voiture']::text[]),
  ('ferrari', 'Ferrari', array['voiture']::text[]),
  ('fiat', 'Fiat', array['voiture', 'utilitaire', 'camping-car']::text[]),
  ('ford', 'Ford', array['voiture', 'utilitaire', 'camping-car']::text[]),
  ('honda', 'Honda', array['voiture', 'moto', 'bateau']::text[]),
  ('hyundai', 'Hyundai', array['voiture']::text[]),
  ('jaguar', 'Jaguar', array['voiture']::text[]),
  ('jeep', 'Jeep', array['voiture']::text[]),
  ('kia', 'Kia', array['voiture']::text[]),
  ('lamborghini', 'Lamborghini', array['voiture']::text[]),
  ('land-rover', 'Land Rover', array['voiture']::text[]),
  ('leapmotor', 'Leapmotor', array['voiture']::text[]),
  ('lexus', 'Lexus', array['voiture']::text[]),
  ('lynk-co', 'Lynk & Co', array['voiture']::text[]),
  ('maserati', 'Maserati', array['voiture']::text[]),
  ('mazda', 'Mazda', array['voiture']::text[]),
  ('mercedes-benz', 'Mercedes-Benz', array['voiture', 'utilitaire', 'camping-car']::text[]),
  ('mg', 'MG', array['voiture']::text[]),
  ('mini', 'Mini', array['voiture']::text[]),
  ('mitsubishi', 'Mitsubishi', array['voiture']::text[]),
  ('nissan', 'Nissan', array['voiture', 'utilitaire']::text[]),
  ('opel', 'Opel', array['voiture', 'utilitaire']::text[]),
  ('peugeot', 'Peugeot', array['voiture', 'utilitaire', 'camping-car', 'moto']::text[]),
  ('polestar', 'Polestar', array['voiture']::text[]),
  ('porsche', 'Porsche', array['voiture']::text[]),
  ('renault', 'Renault', array['voiture', 'utilitaire', 'camping-car']::text[]),
  ('seat', 'Seat', array['voiture']::text[]),
  ('skoda', 'Škoda', array['voiture']::text[]),
  ('smart', 'Smart', array['voiture']::text[]),
  ('kgm', 'KGM (SsangYong)', array['voiture']::text[]),
  ('subaru', 'Subaru', array['voiture']::text[]),
  ('suzuki', 'Suzuki', array['voiture', 'moto', 'bateau']::text[]),
  ('tesla', 'Tesla', array['voiture']::text[]),
  ('toyota', 'Toyota', array['voiture', 'utilitaire']::text[]),
  ('volkswagen', 'Volkswagen', array['voiture', 'utilitaire', 'camping-car']::text[]),
  ('volvo', 'Volvo', array['voiture']::text[]),
  ('aprilia', 'Aprilia', array['moto']::text[]),
  ('benelli', 'Benelli', array['moto']::text[]),
  ('ducati', 'Ducati', array['moto']::text[]),
  ('harley-davidson', 'Harley-Davidson', array['moto']::text[]),
  ('husqvarna', 'Husqvarna', array['moto']::text[]),
  ('indian', 'Indian', array['moto']::text[]),
  ('kawasaki', 'Kawasaki', array['moto']::text[]),
  ('ktm', 'KTM', array['moto']::text[]),
  ('kymco', 'Kymco', array['moto']::text[]),
  ('moto-guzzi', 'Moto Guzzi', array['moto']::text[]),
  ('piaggio', 'Piaggio', array['moto']::text[]),
  ('royal-enfield', 'Royal Enfield', array['moto']::text[]),
  ('sym', 'SYM', array['moto']::text[]),
  ('triumph', 'Triumph', array['moto']::text[]),
  ('vespa', 'Vespa', array['moto']::text[]),
  ('yamaha', 'Yamaha', array['moto', 'bateau']::text[]),
  ('zero', 'Zero Motorcycles', array['moto']::text[]),
  ('daf', 'DAF', array['utilitaire']::text[]),
  ('isuzu', 'Isuzu', array['utilitaire']::text[]),
  ('iveco', 'Iveco', array['utilitaire', 'camping-car']::text[]),
  ('man', 'MAN', array['utilitaire']::text[]),
  ('maxus', 'Maxus', array['utilitaire']::text[]),
  ('renault-trucks', 'Renault Trucks', array['utilitaire']::text[]),
  ('scania', 'Scania', array['utilitaire']::text[]),
  ('volvo-trucks', 'Volvo Trucks', array['utilitaire']::text[]),
  ('adria', 'Adria', array['camping-car']::text[]),
  ('burstner', 'Bürstner', array['camping-car']::text[]),
  ('carado', 'Carado', array['camping-car']::text[]),
  ('chausson', 'Chausson', array['camping-car']::text[]),
  ('dethleffs', 'Dethleffs', array['camping-car']::text[]),
  ('fendt-caravan', 'Fendt Caravan', array['camping-car']::text[]),
  ('hobby', 'Hobby', array['camping-car']::text[]),
  ('hymer', 'Hymer', array['camping-car']::text[]),
  ('knaus', 'Knaus', array['camping-car']::text[]),
  ('pilote', 'Pilote', array['camping-car']::text[]),
  ('rapido', 'Rapido', array['camping-car']::text[]),
  ('sunlight', 'Sunlight', array['camping-car']::text[]),
  ('weinsberg', 'Weinsberg', array['camping-car']::text[]),
  ('batavus', 'Batavus', array['velo']::text[]),
  ('bulls', 'Bulls', array['velo']::text[]),
  ('cannondale', 'Cannondale', array['velo']::text[]),
  ('canyon', 'Canyon', array['velo']::text[]),
  ('cube', 'Cube', array['velo']::text[]),
  ('decathlon', 'Decathlon', array['velo']::text[]),
  ('gazelle', 'Gazelle', array['velo']::text[]),
  ('giant', 'Giant', array['velo']::text[]),
  ('kalkhoff', 'Kalkhoff', array['velo']::text[]),
  ('koga', 'Koga', array['velo']::text[]),
  ('oxford', 'Oxford', array['velo']::text[]),
  ('ridley', 'Ridley', array['velo']::text[]),
  ('riese-muller', 'Riese & Müller', array['velo']::text[]),
  ('scott', 'Scott', array['velo']::text[]),
  ('sparta', 'Sparta', array['velo']::text[]),
  ('specialized', 'Specialized', array['velo']::text[]),
  ('stromer', 'Stromer', array['velo']::text[]),
  ('thompson', 'Thompson', array['velo']::text[]),
  ('trek', 'Trek', array['velo']::text[]),
  ('dualtron', 'Dualtron', array['trottinette']::text[]),
  ('inokim', 'Inokim', array['trottinette']::text[]),
  ('kaabo', 'Kaabo', array['trottinette']::text[]),
  ('pure-electric', 'Pure Electric', array['trottinette']::text[]),
  ('segway-ninebot', 'Segway-Ninebot', array['trottinette']::text[]),
  ('vsett', 'Vsett', array['trottinette']::text[]),
  ('xiaomi', 'Xiaomi', array['trottinette']::text[]),
  ('bavaria', 'Bavaria', array['bateau']::text[]),
  ('beneteau', 'Bénéteau', array['bateau']::text[]),
  ('evinrude', 'Evinrude', array['bateau']::text[]),
  ('jeanneau', 'Jeanneau', array['bateau']::text[]),
  ('mercury', 'Mercury', array['bateau']::text[]),
  ('quicksilver', 'Quicksilver', array['bateau']::text[]),
  ('tohatsu', 'Tohatsu', array['bateau']::text[]),
  ('volvo-penta', 'Volvo Penta', array['bateau']::text[]),
  ('yanmar', 'Yanmar', array['bateau']::text[]),
  ('zodiac', 'Zodiac', array['bateau']::text[])
on conflict (slug) do update set name = excluded.name, vehicles = excluded.vehicles;

insert into public.tool_brands (slug, name, kinds) values
  ('autel', 'Autel', array['diagnostic']::text[]),
  ('beissbarth', 'Beissbarth', array['geometrie', 'pneus', 'freinage']::text[]),
  ('beta', 'Beta', array['outillage']::text[]),
  ('bosch', 'Bosch', array['diagnostic', 'clim', 'freinage']::text[]),
  ('car-o-liner', 'Car-O-Liner', array['carrosserie']::text[]),
  ('celette', 'Celette', array['carrosserie']::text[]),
  ('corghi', 'Corghi', array['pneus', 'geometrie']::text[]),
  ('delphi', 'Delphi', array['diagnostic']::text[]),
  ('facom', 'Facom', array['outillage']::text[]),
  ('gedore', 'Gedore', array['outillage']::text[]),
  ('glasurit', 'Glasurit', array['carrosserie']::text[]),
  ('hazet', 'Hazet', array['outillage']::text[]),
  ('hella-gutmann', 'Hella Gutmann', array['diagnostic', 'geometrie']::text[]),
  ('hofmann', 'Hofmann', array['pneus', 'geometrie']::text[]),
  ('hunter', 'Hunter', array['geometrie', 'pneus']::text[]),
  ('john-bean', 'John Bean', array['geometrie', 'pneus']::text[]),
  ('ks-tools', 'KS Tools', array['outillage']::text[]),
  ('launch', 'Launch', array['diagnostic']::text[]),
  ('maha', 'Maha', array['freinage', 'levage']::text[]),
  ('mahle', 'Mahle', array['clim', 'diagnostic']::text[]),
  ('nussbaum', 'Nussbaum', array['levage']::text[]),
  ('ravaglioli', 'Ravaglioli', array['levage', 'pneus', 'geometrie']::text[]),
  ('sikkens', 'Sikkens', array['carrosserie']::text[]),
  ('snap-on', 'Snap-on', array['outillage', 'diagnostic']::text[]),
  ('spanesi', 'Spanesi', array['carrosserie']::text[]),
  ('stahlwille', 'Stahlwille', array['outillage']::text[]),
  ('standox', 'Standox', array['carrosserie']::text[]),
  ('texa', 'Texa', array['diagnostic', 'clim']::text[]),
  ('wurth', 'Würth', array['outillage']::text[])
on conflict (slug) do update set name = excluded.name, kinds = excluded.kinds;
