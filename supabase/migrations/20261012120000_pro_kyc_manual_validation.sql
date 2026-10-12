-- =============================================================================
-- SafeMarq — Comptes pro vérifiés (KYC) et validation manuelle systématique
--
-- 1. pro_accounts        : une entreprise (BCE) par compte pro, statut KYC
-- 2. garage_submissions  : encodage d'un établissement absent de la base
-- 3. garage_claims       : plus d'auto-approbation, compte pro obligatoire
-- 4. garages             : les champs de confiance ne sont plus modifiables par
--                          les propriétaires (faille : un owner pouvait écrire
--                          sa propre note Google et son nombre d'avis)
-- 5. RPC                 : submit_pro_onboarding, search_claimable_garages,
--                          approve_garage_submission
-- 6. Durcissement du trigger d'attribution admin (email confirmé requis)
--
-- Idempotent : peut être rejoué sans erreur.
-- =============================================================================

create extension if not exists pg_trgm with schema extensions;

-- -----------------------------------------------------------------------------
-- 0. Helpers
-- -----------------------------------------------------------------------------

-- Numéro d'entreprise belge (BCE/KBO) : 10 chiffres, commence par 0 ou 1,
-- les 2 derniers chiffres = 97 - (8 premiers chiffres mod 97).
create or replace function public.is_valid_bce(n text)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select n ~ '^[01][0-9]{9}$'
     and 97 - (substr(n, 1, 8)::bigint % 97) = substr(n, 9, 2)::int;
$$;

-- Libellé FR d'un métier : alimente garages.specialty, lu par le moteur de classement.
create or replace function public.trade_label_fr(slug text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case slug
    when 'entretien' then 'Entretien'
    when 'mecanique' then 'Mécanique générale'
    when 'carrosserie' then 'Carrosserie'
    when 'pneus' then 'Pneumatique'
    when 'depannage' then 'Dépannage'
    when 'detailing' then 'Detailing'
    when 'preparation-perf' then 'Préparation'
    when 'pare-brise' then 'Vitrage & pare-brise'
    when 'electricite' then 'Électricité auto'
    when 'climatisation' then 'Climatisation'
    when 'diagnostic' then 'Diagnostic électronique'
    when 'controle-technique' then 'Contrôle technique'
    when 'pieces' then 'Pièces détachées'
  end;
$$;

do $$ begin
  create type public.pro_account_type as enum ('independent_garage', 'dealer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.kyc_status as enum ('pending', 'needs_info', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- 1. pro_accounts
-- -----------------------------------------------------------------------------

create table if not exists public.pro_accounts (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  account_type    public.pro_account_type not null,
  company_name    text not null check (char_length(btrim(company_name)) between 2 and 160),
  bce_number      text not null check (public.is_valid_bce(bce_number)),
  phone           text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  business_email  text not null check (
                    char_length(business_email) <= 254
                    and business_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
                  ),
  street          text not null check (char_length(btrim(street)) between 3 and 200),
  postal_code     text not null check (postal_code ~ '^[1-9][0-9]{3}$'),
  city            text not null check (char_length(btrim(city)) between 2 and 100),
  contact_locale  text not null default 'fr' check (contact_locale in ('fr', 'nl', 'de', 'en')),
  kyc_status      public.kyc_status not null default 'pending',
  review_note     text check (review_note is null or char_length(review_note) <= 1000),
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Une entreprise = un compte vivant. Un compte refusé (squat) libère le numéro.
create unique index if not exists pro_accounts_bce_live_key
  on public.pro_accounts (bce_number)
  where kyc_status <> 'rejected';

-- File d'attente admin.
create index if not exists pro_accounts_review_queue_idx
  on public.pro_accounts (submitted_at)
  where kyc_status = 'pending';

alter table public.pro_accounts enable row level security;

drop policy if exists "Pros read own account" on public.pro_accounts;
create policy "Pros read own account"
  on public.pro_accounts for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Pros create own account" on public.pro_accounts;
create policy "Pros create own account"
  on public.pro_accounts for insert to authenticated
  with check (user_id = auth.uid());

-- Le pro ne modifie sa fiche KYC que lorsqu'on lui demande un complément :
-- pas de modification pendant que l'admin vérifie.
drop policy if exists "Pros complete own account on request" on public.pro_accounts;
create policy "Pros complete own account on request"
  on public.pro_accounts for update to authenticated
  using (user_id = auth.uid() and kyc_status = 'needs_info')
  with check (user_id = auth.uid());

drop policy if exists "Admins manage pro accounts" on public.pro_accounts;
create policy "Admins manage pro accounts"
  on public.pro_accounts for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.guard_pro_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
begin
  -- service_role / SQL editor : pas d'utilisateur, on laisse passer.
  if auth.uid() is null then
    new.updated_at := now();
    return new;
  end if;

  is_admin := public.has_role(auth.uid(), 'admin');

  if tg_op = 'INSERT' then
    if not is_admin then
      new.kyc_status := 'pending';
      new.review_note := null;
      new.reviewed_at := null;
      new.reviewed_by := null;
      new.submitted_at := now();
    end if;
    new.business_email := lower(btrim(new.business_email));
    return new;
  end if;

  if not is_admin then
    -- Les champs de décision appartiennent à l'admin.
    new.user_id := old.user_id;
    new.kyc_status := old.kyc_status;
    new.review_note := old.review_note;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
    -- Un complément renvoie la demande dans la file.
    if old.kyc_status = 'needs_info' then
      new.kyc_status := 'pending';
      new.submitted_at := now();
    end if;
  elsif new.kyc_status is distinct from old.kyc_status then
    if new.kyc_status = 'pending' then
      new.reviewed_at := null;
      new.reviewed_by := null;
    else
      new.reviewed_at := now();
      new.reviewed_by := auth.uid();
    end if;
  end if;

  new.business_email := lower(btrim(new.business_email));
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_pro_account on public.pro_accounts;
create trigger guard_pro_account
  before insert or update on public.pro_accounts
  for each row execute function public.guard_pro_account();

-- -----------------------------------------------------------------------------
-- 2. garage_submissions (établissement pas encore dans la base)
-- -----------------------------------------------------------------------------

create table if not exists public.garage_submissions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null check (char_length(btrim(name)) between 2 and 160),
  street             text not null check (char_length(btrim(street)) between 3 and 200),
  postal_code        text not null check (postal_code ~ '^[1-9][0-9]{3}$'),
  city               text not null check (char_length(btrim(city)) between 2 and 100),
  phone              text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  website            text check (website is null or char_length(website) <= 300),
  brand              text check (brand is null or char_length(brand) <= 80),
  trades             text[] not null check (
                       cardinality(trades) between 1 and 13
                       and trades <@ array[
                         'entretien', 'mecanique', 'carrosserie', 'pneus', 'depannage',
                         'detailing', 'preparation-perf', 'pare-brise', 'electricite',
                         'climatisation', 'diagnostic', 'controle-technique', 'pieces'
                       ]::text[]
                     ),
  status             text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note        text check (review_note is null or char_length(review_note) <= 1000),
  created_garage_id  uuid references public.garages(id) on delete set null,
  created_at         timestamptz not null default now(),
  reviewed_at        timestamptz
);

create index if not exists garage_submissions_user_idx on public.garage_submissions (user_id);
create index if not exists garage_submissions_queue_idx
  on public.garage_submissions (created_at)
  where status = 'pending';

alter table public.garage_submissions enable row level security;

drop policy if exists "Pros read own submissions" on public.garage_submissions;
create policy "Pros read own submissions"
  on public.garage_submissions for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Pros submit establishments" on public.garage_submissions;
create policy "Pros submit establishments"
  on public.garage_submissions for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.pro_accounts p
      where p.user_id = auth.uid() and p.kyc_status <> 'rejected'
    )
  );

drop policy if exists "Admins manage submissions" on public.garage_submissions;
create policy "Admins manage submissions"
  on public.garage_submissions for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.guard_garage_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;
  new.status := 'pending';
  new.review_note := null;
  new.reviewed_at := null;
  new.created_garage_id := null;
  return new;
end;
$$;

drop trigger if exists guard_garage_submission on public.garage_submissions;
create trigger guard_garage_submission
  before insert on public.garage_submissions
  for each row execute function public.guard_garage_submission();

-- -----------------------------------------------------------------------------
-- 3. garage_claims : validation manuelle uniquement, compte pro obligatoire
-- -----------------------------------------------------------------------------

-- Remplace l'auto-approbation par domaine email : tout passe par l'admin.
create or replace function public.process_garage_claim()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;
  new.status := 'pending';
  new.review_note := null;
  new.reviewed_at := null;
  return new;
end;
$$;

create or replace function public.handle_claim_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    if not exists (
      select 1 from public.pro_accounts
      where user_id = new.user_id and kyc_status = 'approved'
    ) then
      raise exception 'PRO_NOT_APPROVED'
        using hint = 'Validez d''abord le compte pro du demandeur.';
    end if;

    insert into public.garage_owners (user_id, garage_id)
    values (new.user_id, new.garage_id)
    on conflict do nothing;

    insert into public.user_roles (user_id, role)
    values (new.user_id, 'garage_owner')
    on conflict do nothing;
  end if;

  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    new.reviewed_at := coalesce(new.reviewed_at, now());
  end if;
  return new;
end;
$$;

do $$ begin
  alter table public.garage_claims
    add constraint garage_claims_status_check
    check (status in ('pending', 'approved', 'rejected')) not valid;
exception when duplicate_object then null; end $$;

drop policy if exists "Users create own claims" on public.garage_claims;
drop policy if exists "Pros create own claims" on public.garage_claims;
create policy "Pros create own claims"
  on public.garage_claims for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.pro_accounts p
      where p.user_id = auth.uid() and p.kyc_status <> 'rejected'
    )
  );

create index if not exists garage_claims_queue_idx
  on public.garage_claims (created_at)
  where status = 'pending';

-- -----------------------------------------------------------------------------
-- 4. garages : verrouiller les champs qui font le score et la confiance
-- -----------------------------------------------------------------------------

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

  if new.rating         is distinct from old.rating
  or new.reviews_count  is distinct from old.reviews_count
  or new.verified       is distinct from old.verified
  or new.slug           is distinct from old.slug
  or new.name           is distinct from old.name
  or new.type           is distinct from old.type
  or new.price_level    is distinct from old.price_level
  or new.badges         is distinct from old.badges
  or new.quality_scores is distinct from old.quality_scores
  or new.key_insight    is distinct from old.key_insight
  or new.quote          is distinct from old.quote
  or new.address        is distinct from old.address
  or new.coords         is distinct from old.coords
  then
    raise exception 'TRUST_FIELDS_LOCKED'
      using hint = 'Note, avis, nom, adresse et badges sont gérés par SafeMarq.';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_garage_trust_columns on public.garages;
create trigger protect_garage_trust_columns
  before update on public.garages
  for each row execute function public.protect_garage_trust_columns();

-- Recherche floue pour la revendication (nom ou rue).
create index if not exists garages_name_trgm_idx
  on public.garages using gin (name extensions.gin_trgm_ops);
create index if not exists garages_address_trgm_idx
  on public.garages using gin (address extensions.gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- 5. RPC
-- -----------------------------------------------------------------------------

-- Recherche d'établissements à revendiquer. SECURITY DEFINER uniquement pour
-- exposer un booléen "déjà géré" sans révéler qui gère quoi.
create or replace function public.search_claimable_garages(q text)
returns table (id uuid, name text, address text, slug text, managed boolean)
language sql
stable
security definer
set search_path = public
as $$
  with term as (
    select replace(replace(replace(btrim(q), '\', '\\'), '%', '\%'), '_', '\_') as v
  )
  select g.id, g.name, g.address, g.slug,
         exists (select 1 from public.garage_owners o where o.garage_id = g.id) as managed
  from public.garages g, term
  where char_length(btrim(q)) between 2 and 80
    and (g.name ilike '%' || term.v || '%' or g.address ilike '%' || term.v || '%')
  order by extensions.similarity(g.name, btrim(q)) desc, g.name
  limit 8;
$$;

revoke all on function public.search_claimable_garages(text) from public, anon;
grant execute on function public.search_claimable_garages(text) to authenticated;

-- Inscription pro en une seule transaction : compte KYC + établissement.
-- SECURITY INVOKER : les policies RLS et les triggers ci-dessus s'appliquent.
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
      user_id, name, street, postal_code, city, phone, website, brand, trades
    ) values (
      uid,
      btrim(p_new_garage->>'name'),
      btrim(p_new_garage->>'street'),
      p_new_garage->>'postal_code',
      btrim(p_new_garage->>'city'),
      nullif(p_new_garage->>'phone', ''),
      nullif(btrim(p_new_garage->>'website'), ''),
      nullif(btrim(p_new_garage->>'brand'), ''),
      array(select jsonb_array_elements_text(coalesce(p_new_garage->'trades', '[]'::jsonb)))
    );
  end if;
end;
$$;

revoke all on function public.submit_pro_onboarding(jsonb, uuid, jsonb) from public, anon;
grant execute on function public.submit_pro_onboarding(jsonb, uuid, jsonb) to authenticated;

-- Validation admin d'un nouvel établissement : crée la fiche et lie le pro.
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

  -- price_level '€€' est neutre ; coords à compléter par l'admin (géocodage).
  insert into public.garages (slug, name, type, specialty, brand, price_level, address, phone, website, verified)
  values (
    final_slug,
    s.name,
    case when acct.account_type = 'dealer' then 'dealer' else 'independent' end,
    (select string_agg(public.trade_label_fr(t), ' · ') from unnest(s.trades) as t),
    s.brand,
    '€€',
    s.street || ', ' || s.postal_code || ' ' || s.city,
    s.phone,
    s.website,
    false
  )
  returning id into new_garage_id;

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

-- -----------------------------------------------------------------------------
-- 6. Attribution admin : uniquement une fois l'email confirmé
--    (avant : un inscrit non confirmé avec cet email obtenait le rôle admin)
-- -----------------------------------------------------------------------------

create or replace function public.assign_owner_admin_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'gurseveralperen@gmail.com' and new.email_confirmed_at is not null then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::public.app_role)
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_admin on auth.users;
create trigger on_auth_user_created_assign_admin
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.assign_owner_admin_on_signup();
