-- Quote requests carry a way to reach the driver.
-- * contact_email is always the account's own address (set by the server, never typed),
--   so a request cannot be sent in someone else's name.
-- * name and phone are optional; the driver sees that they go to this garage only.
-- * once sent, a request's content and contact details cannot be edited.

alter table public.quote_requests
  add column if not exists contact_name text check (contact_name is null or char_length(contact_name) between 1 and 80),
  add column if not exists contact_phone text check (contact_phone is null or contact_phone ~ '^\+?[0-9 ./()-]{6,24}$'),
  add column if not exists contact_email text check (contact_email is null or char_length(contact_email) <= 254);

create or replace function public.guard_quote_request()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
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
    new.contact_email := (select u.email from auth.users u where u.id = auth.uid());
    new.contact_name := nullif(btrim(new.contact_name), '');
    new.contact_phone := nullif(btrim(new.contact_phone), '');
    return new;
  end if;

  new.id := old.id;
  new.garage_id := old.garage_id;
  new.user_id := old.user_id;
  new.plate := old.plate;
  new.vehicle_type := old.vehicle_type;
  new.service_type := old.service_type;
  new.description := old.description;
  new.created_at := old.created_at;
  new.contact_name := old.contact_name;
  new.contact_phone := old.contact_phone;
  new.contact_email := old.contact_email;
  if new.status is distinct from old.status and not (
       (old.status = 'pending' and new.status in ('accepted', 'rejected'))
    or (old.status = 'accepted' and new.status = 'completed')
  ) then
    raise exception 'INVALID_STATUS' using hint = 'Changement de statut non autorisé.';
  end if;
  return new;
end;
$function$;

-- Whether an establishment can receive requests online (someone manages it).
-- garage_owners itself stays private; this only says yes or no.
create or replace function public.garage_accepts_quotes(p_garage uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.garage_owners o where o.garage_id = p_garage);
$$;

revoke execute on function public.garage_accepts_quotes(uuid) from public;
grant execute on function public.garage_accepts_quotes(uuid) to anon, authenticated;
