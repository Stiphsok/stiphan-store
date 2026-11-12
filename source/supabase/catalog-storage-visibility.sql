-- Apply once in Supabase SQL Editor after store-database.sql.
-- Public catalog images and downloads use public URLs; only approved admins upload files.

create table if not exists public.store_hidden_items (
  catalog_kind text not null check (catalog_kind in ('game', 'app', 'theme')),
  item_id text not null,
  created_at timestamptz not null default now(),
  primary key (catalog_kind, item_id)
);

alter table public.store_hidden_items enable row level security;
grant select on public.store_hidden_items to anon, authenticated;
grant insert, update, delete on public.store_hidden_items to authenticated;

drop policy if exists "Anyone can read hidden catalog identifiers" on public.store_hidden_items;
create policy "Anyone can read hidden catalog identifiers"
on public.store_hidden_items for select to anon, authenticated
using (true);

drop policy if exists "Admins can manage hidden catalog identifiers" on public.store_hidden_items;
create policy "Admins can manage hidden catalog identifiers"
on public.store_hidden_items for all to authenticated
using (public.is_store_admin())
with check (public.is_store_admin());

insert into storage.buckets (id, name, public, file_size_limit)
values ('arena-zips', 'arena-zips', true, 262144000)
on conflict (id) do update
set public = true,
    file_size_limit = 262144000;

drop policy if exists "Arena delete requires approved admin" on storage.objects;
create policy "Arena delete requires approved admin"
on storage.objects for delete to authenticated
using (bucket_id = 'arena-zips' and public.is_store_admin());
