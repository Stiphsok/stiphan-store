create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.store_admins as admin
    where lower(coalesce(to_jsonb(admin) ->> 'email', '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
       or to_jsonb(admin) ->> 'user_id' = auth.uid()::text
       or to_jsonb(admin) ->> 'auth_user_id' = auth.uid()::text
       or to_jsonb(admin) ->> 'id' = auth.uid()::text
  );
$$;

revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;

drop policy if exists "Arena upload requires approved admin" on storage.objects;
create policy "Arena upload requires approved admin"
on storage.objects
as permissive
for insert
to authenticated
with check (bucket_id = 'arena-zips' and public.is_store_admin());

drop policy if exists "Arena bucket restricts uploads to approved admins" on storage.objects;
create policy "Arena bucket restricts uploads to approved admins"
on storage.objects
as restrictive
for insert
to public
with check (bucket_id <> 'arena-zips' or public.is_store_admin());