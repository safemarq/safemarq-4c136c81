-- Security: the email queue wrappers were callable by anyone holding the public key.
--
-- 20260503181933_email_infra revoked EXECUTE from PUBLIC, but Supabase also grants
-- EXECUTE to anon and authenticated by default privileges, so the revoke did nothing.
-- Through /rest/v1/rpc a visitor could read queued auth emails (password reset and
-- confirmation links of other users), enqueue arbitrary emails or delete them.
-- Only the process-email-queue edge function (service role) needs these functions.

revoke execute on function public.enqueue_email(text, jsonb) from public, anon, authenticated;
revoke execute on function public.read_email_batch(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.delete_email(text, bigint) from public, anon, authenticated;
revoke execute on function public.move_to_dlq(text, text, bigint, jsonb) from public, anon, authenticated;
revoke execute on function public.email_queue_dispatch() from public, anon, authenticated;

grant execute on function public.enqueue_email(text, jsonb) to service_role;
grant execute on function public.read_email_batch(text, integer, integer) to service_role;
grant execute on function public.delete_email(text, bigint) to service_role;
grant execute on function public.move_to_dlq(text, text, bigint, jsonb) to service_role;
grant execute on function public.email_queue_dispatch() to service_role;

-- SECURITY DEFINER without a fixed search_path can be hijacked; every call inside is
-- schema-qualified (pgmq.*), so an empty path is safe.
alter function public.enqueue_email(text, jsonb) set search_path = '';
alter function public.read_email_batch(text, integer, integer) set search_path = '';
alter function public.delete_email(text, bigint) set search_path = '';
alter function public.move_to_dlq(text, text, bigint, jsonb) set search_path = '';
