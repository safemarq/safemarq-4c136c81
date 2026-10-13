-- =============================================================================
-- SafeMarq : page /recherche
-- -----------------------------------------------------------------------------
-- * search_garages() renvoie aussi la position (carte) et filtre « vérifiés ».
--   Le type de retour change : DROP puis CREATE (pas de CREATE OR REPLACE possible).
-- * suggest_garages() : suggestions par nom pendant la frappe (pg_trgm).
-- =============================================================================

drop function if exists public.search_garages(double precision, double precision, text, text, integer, text, integer, integer);

create function public.search_garages(
  p_lat           double precision,
  p_lng           double precision,
  p_vehicle       text default 'voiture',
  p_trade         text default null,
  p_radius_km     integer default 15,
  p_sort          text default 'score',
  p_limit         integer default 30,
  p_offset        integer default 0,
  p_verified_only boolean default false
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
  lat              double precision,
  lng              double precision,
  location_precise boolean,
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
           st_y(g.location::geometry) as lat, st_x(g.location::geometry) as lng, g.location_precise,
           st_distance(g.location, o.g) as dist_m
      from public.garages g
      cross join origin o
     where g.location is not null
       and st_dwithin(g.location, o.g, least(greatest(coalesce(p_radius_km, 15), 1), 100) * 1000.0)
       and (not coalesce(p_verified_only, false) or g.verified)
       and exists (
         select 1 from public.garage_services s
          where s.garage_id = g.id
            and s.vehicle = p_vehicle
            and (p_trade is null or s.trade = p_trade)
       )
  )
  select h.id, h.slug, h.name, h.type, h.brand, h.rating, h.reviews_count, h.verified, h.address,
         h.locality, h.postal_code, h.logo_url, h.cover_image_url, h.tier, h.safemarq_score,
         h.lat, h.lng, h.location_precise,
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

grant execute on function public.search_garages(double precision, double precision, text, text, integer, text, integer, integer, boolean)
  to anon, authenticated;

-- Établissements dont le nom ressemble à ce qui est tapé ("delvaux", "garage du parc").
-- Les plus proches d'abord quand on connaît la position du visiteur.
create or replace function public.suggest_garages(
  q       text,
  p_lat   double precision default null,
  p_lng   double precision default null,
  p_limit integer default 5
)
returns table (
  id             uuid,
  slug           text,
  name           text,
  locality       text,
  postal_code    text,
  safemarq_score smallint,
  verified       boolean,
  distance_km    numeric
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with term as (
    select btrim(q) as raw,
           replace(replace(replace(btrim(q), '\', '\\'), '%', '\%'), '_', '\_') as escaped
  ),
  origin as (
    select case
             when p_lat between 49.4 and 51.6 and p_lng between 2.4 and 6.5
             then st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
           end as g
  )
  select g.id, g.slug, g.name, g.locality, g.postal_code, g.safemarq_score, g.verified,
         case when o.g is not null and g.location is not null
              then round((st_distance(g.location, o.g) / 1000)::numeric, 1) end as distance_km
    from public.garages g, term t, origin o
   where char_length(t.raw) between 2 and 80
     and (g.name ilike '%' || t.escaped || '%' or word_similarity(lower(t.raw), lower(g.name)) >= 0.5)
   order by word_similarity(lower(t.raw), lower(g.name)) desc,
            case when o.g is not null and g.location is not null then st_distance(g.location, o.g) end asc nulls last,
            g.safemarq_score desc
   limit least(greatest(coalesce(p_limit, 5), 1), 10);
$$;

grant execute on function public.suggest_garages(text, double precision, double precision, integer) to anon, authenticated;
