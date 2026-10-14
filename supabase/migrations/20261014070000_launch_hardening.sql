-- Hardening before the public launch.
-- 1. Profiles are created at sign-up again (the trigger was missing in production),
--    and a new account no longer shows the start of its email address in public.
-- 2. Reviews: invoices move to a private table, trust fields cannot be set by their
--    author, one review per person and establishment, no review of one's own garage,
--    at most 5 reviews a day.
-- 3. Replies to reviews: only on reviews of one's own establishment, one per review.
-- 4. Quote requests: always created "pending", the garage can only change the status,
--    at most 5 an hour / 15 a day per person.
-- 5. Helpful votes: not on one's own review.
-- 6. Invoice uploads: 10 MB, images and PDF only.

-- ---------------------------------------------------------------------------
-- 1. Profiles
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  given text := nullif(btrim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');
  full_name text := nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')), '');
begin
  -- "Marie Dupont" from Google becomes "Marie D." ; nothing is derived from the email.
  if given is null and full_name is not null then
    given := split_part(full_name, ' ', 1)
      || case when position(' ' in full_name) > 0
              then ' ' || upper(left(btrim(substr(full_name, position(' ' in full_name) + 1)), 1)) || '.'
              else '' end;
  end if;
  insert into public.profiles (user_id, display_name)
  values (new.id, left(given, 60))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts created while the trigger was missing.
insert into public.profiles (user_id, display_name)
select u.id, null
from auth.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id);

-- ---------------------------------------------------------------------------
-- 2. Reviews and their invoices
-- ---------------------------------------------------------------------------
create table if not exists public.review_invoices (
  review_id uuid primary key references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Object path in the private "review-invoices" bucket: <user id>/<file>.
  path text not null check (path ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,120}$'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  checked_by uuid references auth.users(id) on delete set null,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.review_invoices enable row level security;

drop policy if exists "Authors read own invoice" on public.review_invoices;
create policy "Authors read own invoice" on public.review_invoices
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Authors attach an invoice to their review" on public.review_invoices;
create policy "Authors attach an invoice to their review" on public.review_invoices
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and split_part(path, '/', 1) = auth.uid()::text
    and exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid())
  );

drop policy if exists "Admins manage invoices" on public.review_invoices;
create policy "Admins manage invoices" on public.review_invoices
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index if not exists review_invoices_status_idx on public.review_invoices (status, created_at);

-- The column was readable by everyone through the public reviews policy.
insert into public.review_invoices (review_id, user_id, path)
select r.id, r.user_id, r.invoice_url
from public.reviews r
where r.invoice_url is not null and r.invoice_url ~ '^[0-9a-f-]{36}/[A-Za-z0-9._-]{1,120}$'
on conflict (review_id) do nothing;
alter table public.reviews drop column if exists invoice_url;

-- An accepted invoice is what makes a review "verified".
create or replace function public.guard_review_invoice()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.has_role(auth.uid(), 'admin') then
    -- Authors only attach a file; checking it is SafeMarq's job.
    new.status := 'pending';
    new.checked_by := null;
    new.checked_at := null;
    new.created_at := now();
    return new;
  end if;
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    new.checked_by := auth.uid();
    new.checked_at := case when new.status = 'pending' then null else now() end;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_review_invoice on public.review_invoices;
create trigger guard_review_invoice
  before insert or update on public.review_invoices
  for each row execute function public.guard_review_invoice();

create or replace function public.sync_review_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reviews
     set verified = (new.status = 'accepted')
   where id = new.review_id;
  return null;
end;
$$;

drop trigger if exists sync_review_verified on public.review_invoices;
create trigger sync_review_verified
  after insert or update of status on public.review_invoices
  for each row execute function public.sync_review_verified();

-- Fields an author must not set: verification, votes, owner, establishment, date.
create or replace function public.guard_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  shown_name text;
begin
  -- Admins, the service role and updates made by other triggers (vote counts,
  -- invoice checks) are trusted.
  if auth.uid() is null or pg_trigger_depth() > 1 or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if exists (select 1 from public.garage_owners o where o.garage_id = new.garage_id and o.user_id = auth.uid()) then
      raise exception 'OWN_GARAGE' using hint = 'Un établissement ne peut pas noter son propre garage.';
    end if;
    if (select count(*) from public.reviews r where r.user_id = auth.uid() and r.created_at > now() - interval '24 hours') >= 5 then
      raise exception 'RATE_LIMITED' using hint = 'Trop d''avis publiés en 24 heures.';
    end if;
    select nullif(btrim(p.display_name), '') into shown_name from public.profiles p where p.user_id = auth.uid();
    new.user_id := auth.uid();
    new.author_name := coalesce(shown_name, 'Client SafeMarq');
    new.verified := false;
    new.helpful_count := 0;
    new.created_at := now();
  else
    new.user_id := old.user_id;
    new.garage_id := old.garage_id;
    new.author_name := old.author_name;
    new.verified := old.verified;
    new.helpful_count := old.helpful_count;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_review on public.reviews;
create trigger guard_review
  before insert or update on public.reviews
  for each row execute function public.guard_review();

alter table public.reviews drop constraint if exists reviews_one_per_author_and_garage;
alter table public.reviews add constraint reviews_one_per_author_and_garage unique (user_id, garage_id);
alter table public.reviews drop constraint if exists reviews_text_length;
alter table public.reviews add constraint reviews_text_length check (char_length(coalesce(text, '')) <= 4000);
alter table public.reviews drop constraint if exists reviews_author_name_length;
alter table public.reviews add constraint reviews_author_name_length check (char_length(coalesce(author_name, '')) <= 80);

-- ---------------------------------------------------------------------------
-- 3. Replies to reviews
-- ---------------------------------------------------------------------------
drop policy if exists "Garage owners can respond" on public.review_responses;
drop policy if exists "Owners reply to reviews of their establishment" on public.review_responses;
create policy "Owners reply to reviews of their establishment" on public.review_responses
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.garage_owners go
      join public.reviews r on r.garage_id = go.garage_id
      where go.id = review_responses.garage_owner_id
        and go.user_id = auth.uid()
        and r.id = review_responses.review_id
    )
  );

drop policy if exists "Owners edit their replies" on public.review_responses;
create policy "Owners edit their replies" on public.review_responses
  for update to authenticated
  using (exists (select 1 from public.garage_owners go where go.id = garage_owner_id and go.user_id = auth.uid()))
  with check (
    exists (
      select 1
      from public.garage_owners go
      join public.reviews r on r.garage_id = go.garage_id
      where go.id = review_responses.garage_owner_id
        and go.user_id = auth.uid()
        and r.id = review_responses.review_id
    )
  );

drop policy if exists "Owners delete their replies" on public.review_responses;
create policy "Owners delete their replies" on public.review_responses
  for delete to authenticated
  using (exists (select 1 from public.garage_owners go where go.id = garage_owner_id and go.user_id = auth.uid()));

drop policy if exists "Admins manage replies" on public.review_responses;
create policy "Admins manage replies" on public.review_responses
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

alter table public.review_responses drop constraint if exists review_responses_one_per_review;
alter table public.review_responses add constraint review_responses_one_per_review unique (review_id);
alter table public.review_responses drop constraint if exists review_responses_text_length;
alter table public.review_responses add constraint review_responses_text_length check (char_length(text) between 1 and 2000);

-- ---------------------------------------------------------------------------
-- 4. Quote requests
-- ---------------------------------------------------------------------------
alter table public.quote_requests drop constraint if exists quote_requests_status_check;
alter table public.quote_requests add constraint quote_requests_status_check
  check (status in ('pending', 'accepted', 'rejected', 'completed'));
alter table public.quote_requests drop constraint if exists quote_requests_lengths;
alter table public.quote_requests add constraint quote_requests_lengths
  check (char_length(coalesce(description, '')) <= 2000 and char_length(coalesce(plate, '')) <= 16);

create or replace function public.guard_quote_request()
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
    if (select count(*) from public.quote_requests q where q.user_id = auth.uid() and q.created_at > now() - interval '1 hour') >= 5
    or (select count(*) from public.quote_requests q where q.user_id = auth.uid() and q.created_at > now() - interval '24 hours') >= 15 then
      raise exception 'RATE_LIMITED' using hint = 'Trop de demandes de devis : réessayez plus tard.';
    end if;
    new.user_id := auth.uid();
    new.status := 'pending';
    new.created_at := now();
    return new;
  end if;

  -- The establishment answers; it does not rewrite the request.
  new.id := old.id;
  new.garage_id := old.garage_id;
  new.user_id := old.user_id;
  new.plate := old.plate;
  new.vehicle_type := old.vehicle_type;
  new.service_type := old.service_type;
  new.description := old.description;
  new.created_at := old.created_at;
  if new.status is distinct from old.status and not (
       (old.status = 'pending' and new.status in ('accepted', 'rejected'))
    or (old.status = 'accepted' and new.status = 'completed')
  ) then
    raise exception 'INVALID_STATUS' using hint = 'Changement de statut non autorisé.';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_quote_request on public.quote_requests;
create trigger guard_quote_request
  before insert or update on public.quote_requests
  for each row execute function public.guard_quote_request();

-- ---------------------------------------------------------------------------
-- 5. Helpful votes
-- ---------------------------------------------------------------------------
create or replace function public.guard_helpful_vote()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and exists (select 1 from public.reviews r where r.id = new.review_id and r.user_id = auth.uid()) then
    raise exception 'OWN_REVIEW' using hint = 'On ne vote pas pour son propre avis.';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_helpful_vote on public.helpful_votes;
create trigger guard_helpful_vote
  before insert on public.helpful_votes
  for each row execute function public.guard_helpful_vote();

-- ---------------------------------------------------------------------------
-- 6. Invoice uploads
-- ---------------------------------------------------------------------------
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
 where id = 'review-invoices';
