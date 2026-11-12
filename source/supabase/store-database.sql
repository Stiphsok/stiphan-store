-- Run this script in Supabase SQL Editor for the STIPHAN STORE project.
-- Uploaded file bytes belong in Supabase Storage; the catalog stores their metadata.
-- To approve your Supabase Auth account as the first store admin, replace the
-- email below with your login email and run the statement after this script:
-- insert into public.store_admins (user_id)
-- select id from auth.users where lower(email) = lower('YOUR_LOGIN_EMAIL')
-- on conflict (user_id) do nothing;

create table if not exists public.store_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

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

create table if not exists public.store_games (
  id text primary key,
  name text not null,
  category text not null default '',
  icon text not null default '',
  gradient text not null default '',
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  description text not null default '',
  instructions text not null default '',
  image_url text,
  external_url text,
  source_html text,
  featured boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_apps (
  id text primary key,
  name text not null,
  category text not null default '',
  icon text not null default '',
  gradient text not null default '',
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  description text not null default '',
  image_url text,
  external_url text,
  download_url text,
  storage_bucket text,
  storage_path text,
  file_name text,
  file_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  featured boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((storage_bucket is null) = (storage_path is null))
);

create table if not exists public.store_themes (
  id text primary key,
  name text not null,
  icon text not null default '',
  background text not null default '',
  price integer not null default 0 check (price >= 0),
  description text not null default '',
  image_url text,
  featured boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_games_visible_idx on public.store_games (is_hidden, name);
create index if not exists store_apps_visible_idx on public.store_apps (is_hidden, name);
create index if not exists store_themes_visible_idx on public.store_themes (is_hidden, name);

alter table public.store_admins enable row level security;
alter table public.store_games enable row level security;
alter table public.store_apps enable row level security;
alter table public.store_themes enable row level security;

grant select on public.store_games, public.store_apps, public.store_themes to anon, authenticated;
grant insert, update, delete on public.store_games, public.store_apps, public.store_themes to authenticated;

drop policy if exists "Anyone can read visible store games" on public.store_games;
create policy "Anyone can read visible store games"
on public.store_games for select to anon, authenticated
using (not is_hidden);

drop policy if exists "Admins can read all store games" on public.store_games;
create policy "Admins can read all store games"
on public.store_games for select to authenticated
using (public.is_store_admin());

drop policy if exists "Admins can manage store games" on public.store_games;
create policy "Admins can manage store games"
on public.store_games for all to authenticated
using (public.is_store_admin())
with check (public.is_store_admin());

drop policy if exists "Anyone can read visible store apps" on public.store_apps;
create policy "Anyone can read visible store apps"
on public.store_apps for select to anon, authenticated
using (not is_hidden);

drop policy if exists "Admins can read all store apps" on public.store_apps;
create policy "Admins can read all store apps"
on public.store_apps for select to authenticated
using (public.is_store_admin());

drop policy if exists "Admins can manage store apps" on public.store_apps;
create policy "Admins can manage store apps"
on public.store_apps for all to authenticated
using (public.is_store_admin())
with check (public.is_store_admin());

drop policy if exists "Anyone can read visible store themes" on public.store_themes;
create policy "Anyone can read visible store themes"
on public.store_themes for select to anon, authenticated
using (not is_hidden);

drop policy if exists "Admins can read all store themes" on public.store_themes;
create policy "Admins can read all store themes"
on public.store_themes for select to authenticated
using (public.is_store_admin());

drop policy if exists "Admins can manage store themes" on public.store_themes;
create policy "Admins can manage store themes"
on public.store_themes for all to authenticated
using (public.is_store_admin())
with check (public.is_store_admin());
