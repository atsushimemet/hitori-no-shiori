-- atmosphere is no longer used in the UI, and the recommended article keeps its
-- source URL so it can be rendered as a link.
alter table public.places drop column if exists atmosphere;
alter table public.places add column if not exists recommended_article_url text;
