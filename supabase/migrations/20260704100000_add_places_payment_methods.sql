-- 店舗ごとに決済方法（現金 / クレジットカード / PayPay など）を持たせる。
-- get_random_places_by_category は to_jsonb(row) をそのまま返すため、
-- カラムを追加するだけで payment_methods は自動的にレスポンスへ含まれる。
alter table public.places
  add column if not exists payment_methods jsonb not null default '[]'::jsonb;

update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = 'Book Room 栞';
update public.places set payment_methods = '["現金", "クレジットカード", "PayPay"]'::jsonb where name = 'Bookshelf 窓';
update public.places set payment_methods = '["現金"]'::jsonb where name = 'ことばの森';
update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = 'Bar Amber Note';
update public.places set payment_methods = '["現金", "クレジットカード", "交通系IC", "iD", "PayPay"]'::jsonb where name = 'Evening Stand Ebisu';
update public.places set payment_methods = '["現金"]'::jsonb where name = 'Book & Glass Ebisu';
update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = 'Bistro Note';
update public.places set payment_methods = '["現金", "クレジットカード", "PayPay"]'::jsonb where name = 'Table Souffle';
update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = 'Bistro 柏';
update public.places set payment_methods = '["現金"]'::jsonb where name = 'Pasta Hashi Note';
update public.places set payment_methods = '["現金", "PayPay"]'::jsonb where name = 'スパゲッティ喫茶 麦';
update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = '橋の皿';
update public.places set payment_methods = '["現金"]'::jsonb where name = '喫茶 月灯';
update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = '銀座 珈琲室 燈';
update public.places set payment_methods = '["現金"]'::jsonb where name = '喫茶 栞';
update public.places set payment_methods = '["現金", "PayPay", "d払い"]'::jsonb where name = '中華 月星';
update public.places set payment_methods = '["現金"]'::jsonb where name = '飯店 すずらん';
update public.places set payment_methods = '["現金", "PayPay"]'::jsonb where name = '餃子と炒飯 燈火';
update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = 'カレー舎 銀匙';
update public.places set payment_methods = '["現金", "クレジットカード", "PayPay"]'::jsonb where name = '欧風カレー 花時計';
update public.places set payment_methods = '["現金"]'::jsonb where name = 'カレールーム 栞';
update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = 'Vintage Letter';
update public.places set payment_methods = '["現金", "クレジットカード", "iD", "PayPay"]'::jsonb where name = 'Closet 麦';
update public.places set payment_methods = '["現金", "PayPay"]'::jsonb where name = 'Archive Room';
update public.places set payment_methods = '["現金", "クレジットカード", "交通系IC", "QUICPay", "PayPay"]'::jsonb where name = 'Desk Cafe 栞';
update public.places set payment_methods = '["現金", "クレジットカード"]'::jsonb where name = 'Morning Table';
update public.places set payment_methods = '["現金", "クレジットカード", "PayPay"]'::jsonb where name = 'Focus Room';
