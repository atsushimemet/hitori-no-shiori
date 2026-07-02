-- Align DB place_categories.time_options / time_placeholder with the post-#17
-- code values (来店時間の明日候補を削除). Idempotent.

update public.place_categories set time_options = '["今日 15:00", "今日 18:00"]'::jsonb, time_placeholder = '例：今日の15時' where slug = 'bookstore';
update public.place_categories set time_options = '["今日 19:00", "今日 20:00"]'::jsonb, time_placeholder = '例：今日の20時' where slug = 'casual-bar';
update public.place_categories set time_options = '["今日 18:30", "今日 20:00"]'::jsonb, time_placeholder = '例：今日の19時半' where slug = 'casual-bistro';
update public.place_categories set time_options = '["今日 13:00", "今日 18:30"]'::jsonb, time_placeholder = '例：今日の13時' where slug = 'hashiya-pasta';
update public.place_categories set time_options = '["今日 14:00", "今日 16:00"]'::jsonb, time_placeholder = '例：今日の16時' where slug = 'jun-kissa';
update public.place_categories set time_options = '["今日 12:30", "今日 19:00"]'::jsonb, time_placeholder = '例：今日の19時' where slug = 'machi-chuka';
update public.place_categories set time_options = '["今日 13:00", "今日 18:30"]'::jsonb, time_placeholder = '例：今日の18時半' where slug = 'oufu-curry';
update public.place_categories set time_options = '["今日 13:00", "今日 16:00"]'::jsonb, time_placeholder = '例：今日の16時' where slug = 'vintage-clothes';
update public.place_categories set time_options = '["今日 10:00", "今日 13:00"]'::jsonb, time_placeholder = '例：今日の10時' where slug = 'work-friendly-cafe';
