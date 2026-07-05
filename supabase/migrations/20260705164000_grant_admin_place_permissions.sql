-- 管理画面のサーバーAPIは service_role key で接続する。
-- RLS の bypass とは別に、テーブルへの権限が必要な環境があるため明示的に付与する。
grant usage on schema public to service_role;

grant select on public.place_categories to service_role;
grant select, insert, update, delete on public.places to service_role;
