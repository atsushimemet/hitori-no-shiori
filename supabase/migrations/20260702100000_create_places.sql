create extension if not exists pgcrypto;

create table if not exists public.place_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  route text not null unique,
  heading text not null,
  description text not null,
  assistant_question text not null,
  assistant_list_message text not null,
  calendar_place_label text not null,
  interest_target text not null,
  select_prompt text not null,
  time_options jsonb not null default '[]'::jsonb,
  time_placeholder text not null,
  keywords jsonb not null default '[]'::jsonb,
  attribute_schema jsonb not null default '[]'::jsonb,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.place_categories(id) on delete cascade,
  name text not null,
  station text not null,
  walk_minutes integer not null check (walk_minutes >= 0),
  google_map_url text not null,
  atmosphere text not null check (atmosphere in ('静か', 'ほどよい賑わい', '賑やか')),
  seat_info text not null,
  recommended_article text not null,
  instagram_url text,
  attributes jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists places_category_published_idx
  on public.places (category_id, is_published);

create unique index if not exists places_category_name_idx
  on public.places (category_id, name);

alter table public.place_categories enable row level security;
alter table public.places enable row level security;

drop policy if exists "Public can read enabled categories" on public.place_categories;
create policy "Public can read enabled categories"
  on public.place_categories
  for select
  using (is_enabled = true);

drop policy if exists "Public can read published places" on public.places;
create policy "Public can read published places"
  on public.places
  for select
  using (
    is_published = true
    and exists (
      select 1
      from public.place_categories
      where place_categories.id = places.category_id
        and place_categories.is_enabled = true
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_place_categories_updated_at on public.place_categories;
create trigger set_place_categories_updated_at
  before update on public.place_categories
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_places_updated_at on public.places;
create trigger set_places_updated_at
  before update on public.places
  for each row
  execute function public.set_updated_at();

create or replace function public.get_random_places_by_category(
  category_slug text,
  limit_count integer default 3
)
returns jsonb
language sql
volatile
security definer
set search_path = public
as $$
  with category as (
    select *
    from public.place_categories
    where slug = category_slug
      and is_enabled = true
    limit 1
  ),
  random_places as (
    select p.*
    from public.places p
    join category c on c.id = p.category_id
    where p.is_published = true
    order by random()
    limit greatest(limit_count, 0)
  )
  select jsonb_build_object(
    'category',
    (
      select to_jsonb(c) - 'created_at' - 'updated_at' - 'is_enabled'
      from category c
    ),
    'places',
    coalesce(
      (
        select jsonb_agg(to_jsonb(rp) - 'category_id' - 'created_at' - 'updated_at' - 'is_published')
        from random_places rp
      ),
      '[]'::jsonb
    )
  );
$$;
