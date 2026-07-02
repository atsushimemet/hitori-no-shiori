-- Import jun-kissa places from the CSV exported from the source Supabase project.
-- Run from the repo root against the TARGET (hitori-no-shiori) database:
--   psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f supabase/import/load-jun-kissa.sql
--
-- Mapping (source -> places):
--   name / station / google_map_url : as-is
--   walk_minutes                    : empty -> 0 (0 means "要更新" placeholder)
--   seat_info                       : seating_info, empty -> ''
--   recommended_article (+ _url)    : first non-instagram entry in recommendation_links (label + url)
--   instagram_url                   : first instagram entry in recommendation_links (url)
--   attributes                      : {"smoking_policy": ...} when present
--   is_published                    : true

begin;

create temp table staging_jun_kissa (
  id text,
  name text,
  station text,
  station_slug text,
  google_map_url text,
  recommendation_links jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  walk_minutes integer,
  smoking_policy text,
  seating_info text
) on commit drop;

\copy staging_jun_kissa from 'supabase/import/jun-kissa.csv' with (format csv, header true)

-- Full refresh for this category: drop any existing rows (incl. the mock seed)
-- before loading the real data.
delete from public.places
where category_id = (select id from public.place_categories where slug = 'jun-kissa');

insert into public.places (
  category_id, name, station, walk_minutes, google_map_url,
  seat_info, recommended_article, recommended_article_url,
  instagram_url, attributes, is_published
)
select
  (select id from public.place_categories where slug = 'jun-kissa'),
  s.name,
  s.station,
  coalesce(s.walk_minutes, 0),
  s.google_map_url,
  coalesce(nullif(s.seating_info, ''), ''),
  coalesce((
    select l ->> 'label'
    from jsonb_array_elements(coalesce(s.recommendation_links, '[]'::jsonb)) l
    where l ->> 'url' not ilike '%instagram.com%'
    limit 1
  ), ''),
  (
    select l ->> 'url'
    from jsonb_array_elements(coalesce(s.recommendation_links, '[]'::jsonb)) l
    where l ->> 'url' not ilike '%instagram.com%'
    limit 1
  ),
  (
    select l ->> 'url'
    from jsonb_array_elements(coalesce(s.recommendation_links, '[]'::jsonb)) l
    where l ->> 'url' ilike '%instagram.com%'
    limit 1
  ),
  case
    when nullif(s.smoking_policy, '') is not null
      then jsonb_build_object('smoking_policy', s.smoking_policy)
    else '{}'::jsonb
  end,
  true
from staging_jun_kissa s
on conflict (category_id, name) do update set
  station = excluded.station,
  walk_minutes = excluded.walk_minutes,
  google_map_url = excluded.google_map_url,
  seat_info = excluded.seat_info,
  recommended_article = excluded.recommended_article,
  recommended_article_url = excluded.recommended_article_url,
  instagram_url = excluded.instagram_url,
  attributes = excluded.attributes,
  is_published = excluded.is_published;

-- sanity check: how many jun-kissa rows landed
select count(*) as jun_kissa_places
from public.places p
join public.place_categories c on c.id = p.category_id
where c.slug = 'jun-kissa';

commit;
