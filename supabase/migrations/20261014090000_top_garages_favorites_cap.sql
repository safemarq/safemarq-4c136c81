-- National lists for the make and equipment pages, and a ceiling on favourites.

-- ---------------------------------------------------------------------------
-- Best-rated establishments for one make or one equipment brand, whole country.
-- (search_garages needs a point and a radius; these pages start without one.)
-- ---------------------------------------------------------------------------
create or replace function public.top_garages(
  p_make text default null,
  p_tool text default null,
  p_limit integer default 10,
  p_offset integer default 0
)
returns table (
  id uuid, slug text, name text, rating numeric, reviews_count integer, verified boolean,
  address text, locality text, postal_code text, safemarq_score smallint, official boolean,
  total_count bigint
)
language sql
stable
set search_path = public
as $$
  select g.id, g.slug, g.name, g.rating, g.reviews_count, g.verified, g.address, g.locality, g.postal_code,
         g.safemarq_score,
         coalesce(gm.official, false) as official,
         count(*) over () as total_count
    from public.garages g
    left join public.garage_makes gm on gm.garage_id = g.id and gm.make = p_make
   -- At least one filter: this is not a way to page through every listing.
   where (p_make is not null or p_tool is not null)
     and (p_make is null or gm.garage_id is not null)
     and (p_tool is null or exists (
       select 1 from public.garage_tool_brands t where t.garage_id = g.id and t.brand = p_tool
     ))
   order by g.safemarq_score desc, g.reviews_count desc, g.name
   limit least(greatest(coalesce(p_limit, 10), 1), 50)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke execute on function public.top_garages(text, text, integer, integer) from public;
grant execute on function public.top_garages(text, text, integer, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Favourites: a person keeps a short list, not the whole directory.
-- ---------------------------------------------------------------------------
create or replace function public.guard_favorite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.favorites f where f.user_id = new.user_id) >= 300 then
    raise exception 'FAVORITES_LIMIT' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_favorite on public.favorites;
create trigger guard_favorite
  before insert on public.favorites
  for each row execute function public.guard_favorite();
