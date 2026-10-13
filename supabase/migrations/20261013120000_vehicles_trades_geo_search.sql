-- =============================================================================
-- SafeMarq : véhicules × métiers, localisation PostGIS, recherche par rayon
-- -----------------------------------------------------------------------------
-- * Taxonomie (miroir de src/lib/taxonomy.ts, vérifié par taxonomy.test.ts) :
--   vehicle_categories, trades, vehicle_trades.
-- * garage_services : ce que chaque établissement fait, par véhicule.
-- * garages.location (PostGIS) + safemarq_score stocké → tri et rayon côté serveur.
-- * be_postal_codes : centroïdes des localités (GeoNames, CC BY 4.0), pour
--   placer un établissement dont on ne connaît que le code postal.
-- * search_garages() : la recherche publique, sans télécharger toute la table.
-- * Inscription pro : véhicules en plus des métiers, validés contre la taxonomie.
-- =============================================================================

create extension if not exists postgis with schema extensions;

-- -----------------------------------------------------------------------------
-- 1. Taxonomie
-- -----------------------------------------------------------------------------

create table if not exists public.vehicle_categories (
  slug     text primary key check (slug ~ '^[a-z][a-z0-9-]{1,30}$'),
  position smallint not null
);

create table if not exists public.trades (
  slug     text primary key check (slug ~ '^[a-z][a-z0-9-]{1,30}$'),
  group_id text not null check (group_id in ('care', 'electric', 'body', 'road', 'equip', 'services')),
  label_fr text not null,
  position smallint not null
);

create table if not exists public.vehicle_trades (
  vehicle text not null references public.vehicle_categories(slug) on update cascade on delete cascade,
  trade   text not null references public.trades(slug) on update cascade on delete cascade,
  primary key (vehicle, trade)
);

create index if not exists vehicle_trades_trade_idx on public.vehicle_trades (trade);

alter table public.vehicle_categories enable row level security;
alter table public.trades enable row level security;
alter table public.vehicle_trades enable row level security;

drop policy if exists "Taxonomy is public" on public.vehicle_categories;
create policy "Taxonomy is public" on public.vehicle_categories for select to anon, authenticated using (true);
drop policy if exists "Taxonomy is public" on public.trades;
create policy "Taxonomy is public" on public.trades for select to anon, authenticated using (true);
drop policy if exists "Taxonomy is public" on public.vehicle_trades;
create policy "Taxonomy is public" on public.vehicle_trades for select to anon, authenticated using (true);

insert into public.vehicle_categories (slug, position) values
  ('voiture', 1),
  ('moto', 2),
  ('utilitaire', 3),
  ('camping-car', 4),
  ('velo', 5),
  ('trottinette', 6),
  ('bateau', 7)
on conflict (slug) do update set position = excluded.position;

insert into public.trades (slug, group_id, label_fr, position) values
  ('entretien', 'care', 'Entretien', 1),
  ('mecanique', 'care', 'Mécanique générale', 2),
  ('freinage', 'care', 'Freins', 3),
  ('distribution', 'care', 'Courroie de distribution', 4),
  ('embrayage-boite', 'care', 'Embrayage & boîte', 5),
  ('echappement', 'care', 'Échappement', 6),
  ('suspension', 'care', 'Suspension & direction', 7),
  ('injection-turbo', 'care', 'Injection & turbo', 8),
  ('diagnostic', 'electric', 'Diagnostic électronique', 9),
  ('electricite', 'electric', 'Électricité', 10),
  ('climatisation', 'electric', 'Climatisation', 11),
  ('electrique-hybride', 'electric', 'Électrique & hybride', 12),
  ('multimedia', 'electric', 'Audio & multimédia', 13),
  ('alarme', 'electric', 'Alarme & traceur', 14),
  ('cles', 'electric', 'Clés & serrures', 15),
  ('carrosserie', 'body', 'Carrosserie', 16),
  ('peinture', 'body', 'Peinture', 17),
  ('debosselage', 'body', 'Débosselage sans peinture', 18),
  ('pare-brise', 'body', 'Vitrage & pare-brise', 19),
  ('covering', 'body', 'Covering & films', 20),
  ('detailing', 'body', 'Detailing', 21),
  ('lavage', 'body', 'Lavage', 22),
  ('jantes', 'body', 'Jantes', 23),
  ('sellerie', 'body', 'Sellerie', 24),
  ('restauration', 'body', 'Restauration & ancêtres', 25),
  ('etancheite', 'body', 'Étanchéité', 26),
  ('carenage', 'body', 'Carénage & antifouling', 27),
  ('coque', 'body', 'Réparation de coque', 28),
  ('pneus', 'road', 'Pneus', 29),
  ('geometrie', 'road', 'Géométrie', 30),
  ('controle-technique', 'road', 'Contrôle technique', 31),
  ('depannage', 'road', 'Dépannage & remorquage', 32),
  ('preparation-perf', 'equip', 'Préparation & performance', 33),
  ('lpg', 'equip', 'Installation LPG', 34),
  ('attelage', 'equip', 'Attelage', 35),
  ('amenagement', 'equip', 'Aménagement', 36),
  ('tachygraphe', 'equip', 'Tachygraphe', 37),
  ('gaz', 'equip', 'Installation gaz', 38),
  ('voilerie', 'equip', 'Voilerie & gréement', 39),
  ('pieces', 'services', 'Pièces détachées', 40),
  ('pieces-occasion', 'services', 'Pièces d’occasion', 41),
  ('hivernage', 'services', 'Hivernage & gardiennage', 42)
on conflict (slug) do update set group_id = excluded.group_id, label_fr = excluded.label_fr, position = excluded.position;

insert into public.vehicle_trades (vehicle, trade) values
  ('voiture', 'entretien'),
  ('voiture', 'mecanique'),
  ('voiture', 'freinage'),
  ('voiture', 'distribution'),
  ('voiture', 'embrayage-boite'),
  ('voiture', 'echappement'),
  ('voiture', 'suspension'),
  ('voiture', 'injection-turbo'),
  ('voiture', 'diagnostic'),
  ('voiture', 'electricite'),
  ('voiture', 'climatisation'),
  ('voiture', 'electrique-hybride'),
  ('voiture', 'multimedia'),
  ('voiture', 'alarme'),
  ('voiture', 'cles'),
  ('voiture', 'carrosserie'),
  ('voiture', 'peinture'),
  ('voiture', 'debosselage'),
  ('voiture', 'pare-brise'),
  ('voiture', 'covering'),
  ('voiture', 'detailing'),
  ('voiture', 'lavage'),
  ('voiture', 'jantes'),
  ('voiture', 'sellerie'),
  ('voiture', 'restauration'),
  ('voiture', 'pneus'),
  ('voiture', 'geometrie'),
  ('voiture', 'controle-technique'),
  ('voiture', 'depannage'),
  ('voiture', 'preparation-perf'),
  ('voiture', 'lpg'),
  ('voiture', 'attelage'),
  ('voiture', 'amenagement'),
  ('voiture', 'pieces'),
  ('voiture', 'pieces-occasion'),
  ('moto', 'entretien'),
  ('moto', 'mecanique'),
  ('moto', 'freinage'),
  ('moto', 'echappement'),
  ('moto', 'suspension'),
  ('moto', 'diagnostic'),
  ('moto', 'electricite'),
  ('moto', 'electrique-hybride'),
  ('moto', 'alarme'),
  ('moto', 'carrosserie'),
  ('moto', 'peinture'),
  ('moto', 'covering'),
  ('moto', 'detailing'),
  ('moto', 'sellerie'),
  ('moto', 'restauration'),
  ('moto', 'pneus'),
  ('moto', 'controle-technique'),
  ('moto', 'depannage'),
  ('moto', 'preparation-perf'),
  ('moto', 'pieces'),
  ('moto', 'pieces-occasion'),
  ('moto', 'hivernage'),
  ('utilitaire', 'entretien'),
  ('utilitaire', 'mecanique'),
  ('utilitaire', 'freinage'),
  ('utilitaire', 'distribution'),
  ('utilitaire', 'embrayage-boite'),
  ('utilitaire', 'echappement'),
  ('utilitaire', 'suspension'),
  ('utilitaire', 'injection-turbo'),
  ('utilitaire', 'diagnostic'),
  ('utilitaire', 'electricite'),
  ('utilitaire', 'climatisation'),
  ('utilitaire', 'electrique-hybride'),
  ('utilitaire', 'alarme'),
  ('utilitaire', 'carrosserie'),
  ('utilitaire', 'peinture'),
  ('utilitaire', 'pare-brise'),
  ('utilitaire', 'covering'),
  ('utilitaire', 'lavage'),
  ('utilitaire', 'pneus'),
  ('utilitaire', 'geometrie'),
  ('utilitaire', 'controle-technique'),
  ('utilitaire', 'depannage'),
  ('utilitaire', 'attelage'),
  ('utilitaire', 'amenagement'),
  ('utilitaire', 'tachygraphe'),
  ('utilitaire', 'pieces'),
  ('utilitaire', 'pieces-occasion'),
  ('camping-car', 'entretien'),
  ('camping-car', 'mecanique'),
  ('camping-car', 'freinage'),
  ('camping-car', 'distribution'),
  ('camping-car', 'embrayage-boite'),
  ('camping-car', 'suspension'),
  ('camping-car', 'diagnostic'),
  ('camping-car', 'electricite'),
  ('camping-car', 'climatisation'),
  ('camping-car', 'multimedia'),
  ('camping-car', 'alarme'),
  ('camping-car', 'carrosserie'),
  ('camping-car', 'peinture'),
  ('camping-car', 'pare-brise'),
  ('camping-car', 'etancheite'),
  ('camping-car', 'sellerie'),
  ('camping-car', 'lavage'),
  ('camping-car', 'pneus'),
  ('camping-car', 'controle-technique'),
  ('camping-car', 'depannage'),
  ('camping-car', 'attelage'),
  ('camping-car', 'amenagement'),
  ('camping-car', 'gaz'),
  ('camping-car', 'pieces'),
  ('camping-car', 'hivernage'),
  ('velo', 'entretien'),
  ('velo', 'mecanique'),
  ('velo', 'freinage'),
  ('velo', 'suspension'),
  ('velo', 'diagnostic'),
  ('velo', 'electricite'),
  ('velo', 'pneus'),
  ('velo', 'depannage'),
  ('velo', 'pieces'),
  ('trottinette', 'entretien'),
  ('trottinette', 'mecanique'),
  ('trottinette', 'freinage'),
  ('trottinette', 'diagnostic'),
  ('trottinette', 'electricite'),
  ('trottinette', 'pneus'),
  ('trottinette', 'pieces'),
  ('bateau', 'entretien'),
  ('bateau', 'mecanique'),
  ('bateau', 'electricite'),
  ('bateau', 'detailing'),
  ('bateau', 'sellerie'),
  ('bateau', 'carenage'),
  ('bateau', 'coque'),
  ('bateau', 'depannage'),
  ('bateau', 'voilerie'),
  ('bateau', 'pieces'),
  ('bateau', 'hivernage')
on conflict do nothing;

-- Libellé FR d'un métier (back-office, emails) : lu dans la table.
create or replace function public.trade_label_fr(slug text)
returns text
language sql
stable
parallel safe
set search_path = ''
as $$
  select t.label_fr from public.trades t where t.slug = trade_label_fr.slug;
$$;

-- -----------------------------------------------------------------------------
-- 2. Services d'un établissement
-- -----------------------------------------------------------------------------

create table if not exists public.garage_services (
  garage_id  uuid not null references public.garages(id) on delete cascade,
  vehicle    text not null,
  trade      text not null,
  created_at timestamptz not null default now(),
  primary key (garage_id, vehicle, trade),
  foreign key (vehicle, trade) references public.vehicle_trades(vehicle, trade) on update cascade on delete cascade
);

-- La recherche part du couple (véhicule, métier) puis rejoint garages.
create index if not exists garage_services_lookup_idx on public.garage_services (vehicle, trade, garage_id);

alter table public.garage_services enable row level security;

drop policy if exists "Services are public" on public.garage_services;
create policy "Services are public"
  on public.garage_services for select to anon, authenticated using (true);

drop policy if exists "Owners and admins manage services" on public.garage_services;
create policy "Owners and admins manage services"
  on public.garage_services for all to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.garage_owners o where o.garage_id = garage_services.garage_id and o.user_id = auth.uid())
  )
  with check (
    public.has_role(auth.uid(), 'admin')
    or exists (select 1 from public.garage_owners o where o.garage_id = garage_services.garage_id and o.user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 3. Codes postaux belges : un point par code (données : migration suivante)
-- -----------------------------------------------------------------------------

create table if not exists public.be_postal_codes (
  postal_code text primary key check (postal_code ~ '^[1-9][0-9]{3}$'),
  name        text not null,
  region      char(1) not null check (region in ('b', 'w', 'f')),
  location    extensions.geography(Point, 4326) not null
);

alter table public.be_postal_codes enable row level security;
drop policy if exists "Postal codes are public" on public.be_postal_codes;
create policy "Postal codes are public" on public.be_postal_codes for select to anon, authenticated using (true);

-- -----------------------------------------------------------------------------
-- 4. garages : position, code postal, score stocké
-- -----------------------------------------------------------------------------

alter table public.garages
  add column if not exists postal_code text check (postal_code is null or postal_code ~ '^[1-9][0-9]{3}$'),
  add column if not exists locality text check (locality is null or char_length(locality) <= 100),
  add column if not exists location extensions.geography(Point, 4326),
  -- false = centroïde du code postal, à préciser (géocodage ou admin)
  add column if not exists location_precise boolean not null default false;

-- Même formule que le site : 60 % note sur 5, 40 % volume d'avis (log, plafonné à 500).
alter table public.garages
  add column if not exists safemarq_score smallint generated always as (
    round(
      least(greatest(rating, 0), 5) / 5 * 60
      + least(log(10, (greatest(reviews_count, 0) + 1)::numeric) / log(10, 501::numeric), 1) * 40
    )::smallint
  ) stored;

create index if not exists garages_location_gix on public.garages using gist (location);
create index if not exists garages_postal_code_idx on public.garages (postal_code);

-- Position : une valeur explicite (location) gagne ; sinon les coordonnées
-- historiques (coords jsonb) ; sinon le centroïde du code postal.
create or replace function public.sync_garage_location()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
declare
  lat double precision;
  lng double precision;
begin
  if new.postal_code is null then
    new.postal_code := substring(new.address from '([1-9][0-9]{3})\s+[^0-9,]+$');
  end if;
  if new.locality is null and new.address is not null then
    new.locality := nullif(btrim(substring(new.address from '[1-9][0-9]{3}\s+([^0-9,]+)$')), '');
  end if;

  if (tg_op = 'INSERT' and new.location is null)
     or (tg_op = 'UPDATE' and new.location is not distinct from old.location and new.coords is distinct from old.coords) then
    lat := (new.coords->>'lat')::double precision;
    lng := (new.coords->>'lng')::double precision;
    if lat between 49.4 and 51.6 and lng between 2.4 and 6.5 then
      new.location := st_setsrid(st_makepoint(lng, lat), 4326)::geography;
      new.location_precise := true;
    end if;
  end if;

  if new.location is null and new.postal_code is not null then
    select p.location into new.location
      from public.be_postal_codes p
     where p.postal_code = new.postal_code;
    new.location_precise := false;
  end if;

  -- Les pages historiques lisent encore coords : on le garde aligné.
  if new.location is not null then
    new.coords := jsonb_build_object(
      'lat', round(st_y(new.location::geometry)::numeric, 6),
      'lng', round(st_x(new.location::geometry)::numeric, 6)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists sync_garage_location on public.garages;
create trigger sync_garage_location
  before insert or update on public.garages
  for each row execute function public.sync_garage_location();

-- Les propriétaires ne déplacent pas leur fiche : la position fait le classement.
create or replace function public.protect_garage_trust_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if new.rating           is distinct from old.rating
  or new.reviews_count    is distinct from old.reviews_count
  or new.verified         is distinct from old.verified
  or new.slug             is distinct from old.slug
  or new.name             is distinct from old.name
  or new.type             is distinct from old.type
  or new.price_level      is distinct from old.price_level
  or new.badges           is distinct from old.badges
  or new.quality_scores   is distinct from old.quality_scores
  or new.key_insight      is distinct from old.key_insight
  or new.quote            is distinct from old.quote
  or new.address          is distinct from old.address
  or new.coords           is distinct from old.coords
  or new.location         is distinct from old.location
  or new.location_precise is distinct from old.location_precise
  or new.postal_code      is distinct from old.postal_code
  or new.locality         is distinct from old.locality
  then
    raise exception 'TRUST_FIELDS_LOCKED'
      using hint = 'Note, avis, nom, adresse et badges sont gérés par SafeMarq.';
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 5. Recherche publique
-- -----------------------------------------------------------------------------

-- Établissements qui font (véhicule, métier) dans un rayon, classés par score
-- (ou par distance). SECURITY INVOKER : la RLS de garages s'applique.
create or replace function public.search_garages(
  p_lat       double precision,
  p_lng       double precision,
  p_vehicle   text default 'voiture',
  p_trade     text default null,
  p_radius_km integer default 15,
  p_sort      text default 'score',
  p_limit     integer default 30,
  p_offset    integer default 0
)
returns table (
  id               uuid,
  slug             text,
  name             text,
  type             text,
  brand            text,
  rating           numeric,
  reviews_count    integer,
  verified         boolean,
  address          text,
  locality         text,
  postal_code      text,
  logo_url         text,
  cover_image_url  text,
  tier             public.garage_tier,
  safemarq_score   smallint,
  distance_km      numeric,
  total_count      bigint
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with origin as (
    select st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography as g
     where p_lat between 49.4 and 51.6 and p_lng between 2.4 and 6.5
  ),
  hits as (
    select g.id, g.slug, g.name, g.type, g.brand, g.rating, g.reviews_count, g.verified, g.address,
           g.locality, g.postal_code, g.logo_url, g.cover_image_url, g.tier, g.safemarq_score,
           st_distance(g.location, o.g) as dist_m
      from public.garages g
      cross join origin o
     where g.location is not null
       and st_dwithin(g.location, o.g, least(greatest(coalesce(p_radius_km, 15), 1), 100) * 1000.0)
       and exists (
         select 1 from public.garage_services s
          where s.garage_id = g.id
            and s.vehicle = p_vehicle
            and (p_trade is null or s.trade = p_trade)
       )
  )
  select h.id, h.slug, h.name, h.type, h.brand, h.rating, h.reviews_count, h.verified, h.address,
         h.locality, h.postal_code, h.logo_url, h.cover_image_url, h.tier, h.safemarq_score,
         round((h.dist_m / 1000)::numeric, 1) as distance_km,
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

grant execute on function public.search_garages(double precision, double precision, text, text, integer, text, integer, integer)
  to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. Inscription pro : véhicules + métiers validés contre la taxonomie
-- -----------------------------------------------------------------------------

alter table public.garage_submissions
  add column if not exists vehicles text[] not null default array['voiture']::text[];

alter table public.garage_submissions drop constraint if exists garage_submissions_trades_check;
alter table public.garage_submissions drop constraint if exists garage_submissions_services_size_check;
alter table public.garage_submissions add constraint garage_submissions_services_size_check
  check (cardinality(trades) between 1 and 60 and cardinality(vehicles) between 1 and 10);

create or replace function public.validate_garage_submission_services()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    select 1 from unnest(new.vehicles) v
     where not exists (select 1 from public.vehicle_categories c where c.slug = v)
  ) then
    raise exception 'INVALID_VEHICLE';
  end if;
  -- Chaque métier doit exister pour au moins un des véhicules choisis.
  if exists (
    select 1 from unnest(new.trades) t
     where not exists (select 1 from public.vehicle_trades vt where vt.trade = t and vt.vehicle = any (new.vehicles))
  ) then
    raise exception 'INVALID_TRADE';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_garage_submission_services on public.garage_submissions;
create trigger validate_garage_submission_services
  before insert or update of vehicles, trades on public.garage_submissions
  for each row execute function public.validate_garage_submission_services();

create or replace function public.submit_pro_onboarding(
  p_account jsonb default null,
  p_claim_garage_id uuid default null,
  p_new_garage jsonb default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  current_status public.kyc_status;
  contact_email text;
begin
  if uid is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if p_claim_garage_id is not null and p_new_garage is not null then
    raise exception 'ONE_ESTABLISHMENT_AT_A_TIME';
  end if;

  select kyc_status into current_status from public.pro_accounts where user_id = uid;

  if p_account is not null then
    if current_status is null then
      insert into public.pro_accounts (
        user_id, account_type, company_name, bce_number, phone, business_email,
        street, postal_code, city, contact_locale
      ) values (
        uid,
        (p_account->>'account_type')::public.pro_account_type,
        btrim(p_account->>'company_name'),
        p_account->>'bce_number',
        p_account->>'phone',
        p_account->>'business_email',
        btrim(p_account->>'street'),
        p_account->>'postal_code',
        btrim(p_account->>'city'),
        coalesce(p_account->>'contact_locale', 'fr')
      );
      if p_claim_garage_id is null and p_new_garage is null then
        raise exception 'ESTABLISHMENT_REQUIRED';
      end if;
    elsif current_status = 'needs_info' then
      update public.pro_accounts set
        account_type   = (p_account->>'account_type')::public.pro_account_type,
        company_name   = btrim(p_account->>'company_name'),
        bce_number     = p_account->>'bce_number',
        phone          = p_account->>'phone',
        business_email = p_account->>'business_email',
        street         = btrim(p_account->>'street'),
        postal_code    = p_account->>'postal_code',
        city           = btrim(p_account->>'city'),
        contact_locale = coalesce(p_account->>'contact_locale', contact_locale)
      where user_id = uid;
    elsif current_status = 'rejected' then
      raise exception 'ACCOUNT_REJECTED';
    else
      raise exception 'ALREADY_SUBMITTED';
    end if;
  elsif current_status is null or current_status = 'rejected' then
    raise exception 'ACCOUNT_REQUIRED';
  end if;

  select business_email into contact_email from public.pro_accounts where user_id = uid;

  if p_claim_garage_id is not null then
    insert into public.garage_claims (user_id, garage_id, business_email, justification)
    values (uid, p_claim_garage_id, contact_email, null);
  end if;

  if p_new_garage is not null then
    insert into public.garage_submissions (
      user_id, name, street, postal_code, city, phone, website, brand, vehicles, trades
    ) values (
      uid,
      btrim(p_new_garage->>'name'),
      btrim(p_new_garage->>'street'),
      p_new_garage->>'postal_code',
      btrim(p_new_garage->>'city'),
      nullif(p_new_garage->>'phone', ''),
      nullif(btrim(p_new_garage->>'website'), ''),
      nullif(btrim(p_new_garage->>'brand'), ''),
      coalesce(
        nullif(array(select jsonb_array_elements_text(coalesce(p_new_garage->'vehicles', '[]'::jsonb))), '{}'),
        array['voiture']
      ),
      array(select jsonb_array_elements_text(coalesce(p_new_garage->'trades', '[]'::jsonb)))
    );
  end if;
end;
$$;

revoke all on function public.submit_pro_onboarding(jsonb, uuid, jsonb) from public, anon;
grant execute on function public.submit_pro_onboarding(jsonb, uuid, jsonb) to authenticated;

-- Validation admin : crée la fiche, ses services (véhicules × métiers) et lie le pro.
create or replace function public.approve_garage_submission(p_submission_id uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.garage_submissions%rowtype;
  acct public.pro_accounts%rowtype;
  base_slug text;
  final_slug text;
  suffix int := 1;
  new_garage_id uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'ACCESS_DENIED';
  end if;

  select * into s from public.garage_submissions where id = p_submission_id for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
  if s.status <> 'pending' then
    raise exception 'ALREADY_REVIEWED';
  end if;

  select * into acct from public.pro_accounts where user_id = s.user_id;
  if acct.kyc_status is distinct from 'approved' then
    raise exception 'PRO_NOT_APPROVED'
      using hint = 'Validez d''abord le compte pro du demandeur.';
  end if;

  base_slug := btrim(
    regexp_replace(
      translate(lower(s.name || '-' || s.city), 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿ', 'aaaaaaceeeeiiiinooooouuuuyy'),
      '[^a-z0-9]+', '-', 'g'
    ),
    '-'
  );
  final_slug := base_slug;
  while exists (select 1 from public.garages where slug = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix;
  end loop;

  -- Position : centroïde du code postal (trigger), à préciser par l'admin.
  insert into public.garages (
    slug, name, type, specialty, brand, price_level, address, postal_code, locality,
    phone, website, verified, vehicle_types
  )
  values (
    final_slug,
    s.name,
    case when acct.account_type = 'dealer' then 'dealer' else 'independent' end,
    (select string_agg(public.trade_label_fr(t), ' · ') from unnest(s.trades) as t),
    s.brand,
    '€€',
    s.street || ', ' || s.postal_code || ' ' || s.city,
    s.postal_code,
    s.city,
    s.phone,
    s.website,
    false,
    to_jsonb(s.vehicles)
  )
  returning id into new_garage_id;

  insert into public.garage_services (garage_id, vehicle, trade)
  select new_garage_id, vt.vehicle, vt.trade
    from public.vehicle_trades vt
   where vt.vehicle = any (s.vehicles)
     and vt.trade = any (s.trades)
  on conflict do nothing;

  insert into public.garage_owners (user_id, garage_id)
  values (s.user_id, new_garage_id)
  on conflict do nothing;

  insert into public.user_roles (user_id, role)
  values (s.user_id, 'garage_owner')
  on conflict do nothing;

  update public.garage_submissions
     set status = 'approved',
         review_note = p_note,
         reviewed_at = now(),
         created_garage_id = new_garage_id
   where id = s.id;

  return new_garage_id;
end;
$$;

revoke all on function public.approve_garage_submission(uuid, text) from public, anon;
grant execute on function public.approve_garage_submission(uuid, text) to authenticated;
