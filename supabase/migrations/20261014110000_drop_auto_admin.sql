-- Hardening follow-up.
-- 1. The owner already has the admin role. The trigger that granted it to any new
--    account created with the owner's e-mail (before the address is even confirmed)
--    would hand admin rights to whoever registers that address if the account were
--    ever deleted. It goes; admins are named by an admin from now on.
drop trigger if exists on_auth_user_created_assign_admin on auth.users;
drop function if exists public.assign_owner_admin_on_signup();

-- 2. Admin-only function: visitors who are not signed in have no reason to call it
--    (it already refuses non-admins; this is defence in depth).
revoke execute on function public.get_admin_users() from public, anon;
