insert into public.place_categories (
  slug, label, route, heading, description, assistant_question, assistant_list_message,
  calendar_place_label, interest_target, select_prompt, time_options, time_placeholder, keywords, attribute_schema, is_enabled
) values
  ('bookstore', '本屋', '/bookstore', '今日のひとり時間に、
合いそうな本屋を三軒。', '神保町で、棚を眺めながらひとり時間を過ごせる場所を選びました。', '本屋さんですね。どのあたりで歩きたいですか？', '神保町で、目的を決めずに歩ける本屋をリストアップしました。', '本屋', '本屋', 'どの本屋に行ってみたいですか？', '["今日 15:00","今日 18:00","明日 11:00"]'::jsonb, '例：明日の11時', '["本屋","書店","本","ブックストア"]'::jsonb, '[]'::jsonb, true),
  ('casual-bar', 'カジュアルバー', '/casual-bar', '今日のひとり時間に、
合いそうなバーを三軒。', '恵比寿で、静かに過ごせる場所を選びました。', '近所のバーですね、場所はどちらを希望されますか？', '恵比寿ですね、以下のバーをリストアップしました。', 'お店', 'お店', 'どのお店に行ってみたいですか？', '["今日 19:00","今日 20:00","明日 19:00"]'::jsonb, '例：今日の20時', '["バー","bar"]'::jsonb, '[{"key":"price_range","label":"価格帯"}]'::jsonb, true),
  ('casual-bistro', 'カジュアルビストロ', '/casual-bistro', '今日のひとり時間に、
合いそうなビストロを三軒。', '代々木上原で、肩肘張らずに食事できる場所を選びました。', 'カジュアルなビストロですね。どのあたりで探しますか？', '代々木上原で、ひとりでも入りやすいビストロをリストアップしました。', 'お店', 'お店', 'どのビストロに行ってみたいですか？', '["今日 18:30","今日 20:00","明日 19:00"]'::jsonb, '例：今日の19時半', '["カジュアルビストロ","ビストロ","フレンチ"]'::jsonb, '[]'::jsonb, true),
  ('hashiya-pasta', 'ハシヤ系パスタ', '/hashiya-pasta', '今日のひとり時間に、
合いそうなパスタを三軒。', '代々木八幡で、和風パスタをゆっくり楽しめる場所を選びました。', 'ハシヤ系パスタですね。行きやすいエリアはありますか？', '代々木八幡で、ハシヤ系パスタの気分に合う店をリストアップしました。', 'お店', 'お店', 'どのパスタ店に行ってみたいですか？', '["今日 13:00","今日 18:30","明日 12:30"]'::jsonb, '例：明日の13時', '["ハシヤ","パスタ","スパゲッティ","スパゲティ"]'::jsonb, '[]'::jsonb, true),
  ('jun-kissa', '純喫茶', '/jun-kissa', '今日のひとり時間に、
合いそうな喫茶店を三軒。', '銀座で、静かに過ごせる場所を選びました。', '静かな喫茶店ですね。場所はどちらを希望されますか？', '銀座で静かに過ごせる喫茶店をリストアップしました。', '喫茶店', '喫茶店', 'どの喫茶店に行ってみたいですか？', '["今日 14:00","今日 16:00","明日 15:00"]'::jsonb, '例：今日の16時', '["喫茶店","カフェ"]'::jsonb, '[{"key":"smoking_policy","label":"喫煙可否"}]'::jsonb, true),
  ('machi-chuka', '町中華', '/machi-chuka', '今日のひとり時間に、
合いそうな町中華を三軒。', '神保町で、気軽に一皿を楽しめる場所を選びました。', '町中華ですね。どのあたりで探しますか？', '神保町で、ひとりでも入りやすい町中華をリストアップしました。', 'お店', 'お店', 'どの町中華に行ってみたいですか？', '["今日 12:30","今日 19:00","明日 12:00"]'::jsonb, '例：今日の19時', '["町中華","中華","餃子","炒飯","チャーハン","ラーメン"]'::jsonb, '[]'::jsonb, true),
  ('oufu-curry', '欧風カレー', '/oufu-curry', '今日のひとり時間に、
合いそうな欧風カレーを三軒。', '神保町で、ゆっくり味わえるカレーの場所を選びました。', '欧風カレーですね。どのあたりで探しますか？', '神保町で、ひとり時間に合う欧風カレーをリストアップしました。', 'お店', 'お店', 'どのカレー店に行ってみたいですか？', '["今日 13:00","今日 18:30","明日 12:30"]'::jsonb, '例：今日の18時半', '["欧風カレー","カレー"]'::jsonb, '[]'::jsonb, true),
  ('vintage-clothes', '古着', '/vintage-clothes', '今日のひとり時間に、
合いそうな古着屋を三軒。', '高円寺で、長く着たい一着を探せる場所を選びました。', '古着ですね。どのあたりで探したいですか？', '高円寺で、ひとりでじっくり見られる古着屋をリストアップしました。', '古着屋', '古着屋', 'どの古着屋に行ってみたいですか？', '["今日 16:00","明日 13:00","明日 16:00"]'::jsonb, '例：明日の16時', '["古着","ヴィンテージ","ビンテージ","服","洋服"]'::jsonb, '[]'::jsonb, true),
  ('work-friendly-cafe', '作業向きカフェ', '/work-friendly-cafe', '今日のひとり時間に、
合いそうな作業場所を三軒。', '代々木上原で、午前中から集中しやすい場所を選びました。', '作業がはかどる場所ですね。どのあたりで探しますか？', '代々木上原で、作業がはかどる場所をリストアップしました。', '場所', '場所', 'どの場所に行ってみたいですか？', '["今日 10:00","今日 13:00","明日 10:00"]'::jsonb, '例：明日の10時', '["作業","仕事","集中","pc","PC","電源","wifi","Wi-Fi","ワイファイ"]'::jsonb, '[]'::jsonb, true)
on conflict (slug) do update set
  label = excluded.label,
  route = excluded.route,
  heading = excluded.heading,
  description = excluded.description,
  assistant_question = excluded.assistant_question,
  assistant_list_message = excluded.assistant_list_message,
  calendar_place_label = excluded.calendar_place_label,
  interest_target = excluded.interest_target,
  select_prompt = excluded.select_prompt,
  time_options = excluded.time_options,
  time_placeholder = excluded.time_placeholder,
  keywords = excluded.keywords,
  attribute_schema = excluded.attribute_schema,
  is_enabled = excluded.is_enabled;

insert into public.places (
  category_id, name, station, walk_minutes, google_map_url, atmosphere, seat_info,
  recommended_article, instagram_url, attributes, is_published
) values
  ((select id from public.place_categories where slug = 'bookstore'), 'Book Room 栞', '神保町駅', 3, 'https://www.google.com/maps/search/?api=1&query=Book%20Room%20Shiori%20Jimbocho', '静か', '全10席（カウンター0・テーブル10）', '買う本を決めずに歩きたい神保町の本屋', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'bookstore'), 'Bookshelf 窓', '御茶ノ水駅', 6, 'https://www.google.com/maps/search/?api=1&query=Bookshelf%20Mado%20Ochanomizu', 'ほどよい賑わい', '全8席（カウンター0・テーブル8）', '新しい棚に出会える週末の書店案内', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'bookstore'), 'ことばの森', '神保町駅', 5, 'https://www.google.com/maps/search/?api=1&query=Kotoba%20no%20Mori%20Jimbocho', '静か', '全12席（カウンター0・テーブル12）', 'ひとりで選ぶ時間を大切にできる本屋', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'casual-bar'), 'Bar Amber Note', '恵比寿駅', 3, 'https://www.google.com/maps/search/?api=1&query=Bar%20Amber%20Note%20Ebisu', '静か', '全18席（カウンター8・テーブル10）', '恵比寿で静かに飲めるカジュアルバー', null, '{"price_range":"確認中"}'::jsonb, true),
  ((select id from public.place_categories where slug = 'casual-bar'), 'Evening Stand Ebisu', '恵比寿駅', 5, 'https://www.google.com/maps/search/?api=1&query=Evening%20Stand%20Ebisu', 'ほどよい賑わい', '全24席（カウンター10・テーブル14）', '仕事帰りに寄りたい恵比寿のバー', null, '{"price_range":"確認中"}'::jsonb, true),
  ((select id from public.place_categories where slug = 'casual-bar'), 'Book & Glass Ebisu', '恵比寿駅', 7, 'https://www.google.com/maps/search/?api=1&query=Book%20%26%20Glass%20Ebisu', '静か', '全12席（カウンター6・テーブル6）', 'ひとりで過ごしやすい夜の隠れ家', null, '{"price_range":"確認中"}'::jsonb, true),
  ((select id from public.place_categories where slug = 'casual-bistro'), 'Bistro Note', '代々木上原駅', 4, 'https://www.google.com/maps/search/?api=1&query=Bistro%20Note%20Yoyogi%20Uehara', '静か', '全22席（カウンター6・テーブル16）', 'ひとりで寄れる小さなビストロ案内', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'casual-bistro'), 'Table Souffle', '代々木上原駅', 5, 'https://www.google.com/maps/search/?api=1&query=Table%20Souffle%20Yoyogi%20Uehara', 'ほどよい賑わい', '全28席（カウンター8・テーブル20）', '気軽な一皿で夜を整える店', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'casual-bistro'), 'Bistro 柏', '代々木公園駅', 7, 'https://www.google.com/maps/search/?api=1&query=Bistro%20Kashiwa%20Tomigaya', '静か', '全19席（カウンター5・テーブル14）', '富ヶ谷で静かに食事したい日に', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'hashiya-pasta'), 'Pasta Hashi Note', '代々木八幡駅', 3, 'https://www.google.com/maps/search/?api=1&query=Pasta%20Hashi%20Note%20Yoyogi%20Hachiman', '静か', '全19席（カウンター7・テーブル12）', 'たらこスパゲッティを静かに食べたい日', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'hashiya-pasta'), 'スパゲッティ喫茶 麦', '代々木公園駅', 5, 'https://www.google.com/maps/search/?api=1&query=Spaghetti%20Kissa%20Mugi%20Yoyogi%20Koen', 'ほどよい賑わい', '全20席（カウンター10・テーブル10）', '和風パスタでひと息つく昼', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'hashiya-pasta'), '橋の皿', '代々木上原駅', 8, 'https://www.google.com/maps/search/?api=1&query=Hashiya%20Style%20Pasta%20Tomigaya', '静か', '全20席（カウンター6・テーブル14）', '納豆ときのこのパスタが似合う午後', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'jun-kissa'), '喫茶 月灯', '銀座駅', 3, 'https://www.google.com/maps/search/?api=1&query=%E5%96%AB%E8%8C%B6%20%E6%9C%88%E7%81%AF%20%E9%8A%80%E5%BA%A7', '静か', '全22席（カウンター4・テーブル18）', '銀座で本を読みたい静かな喫茶店', null, '{"smoking_policy":"確認中"}'::jsonb, true),
  ((select id from public.place_categories where slug = 'jun-kissa'), '銀座 珈琲室 燈', '銀座一丁目駅', 4, 'https://www.google.com/maps/search/?api=1&query=%E9%8A%80%E5%BA%A7%20%E7%8F%88%E7%90%B2%E5%AE%A4%20%E7%87%88', 'ほどよい賑わい', '全30席（カウンター6・テーブル24）', '銀座で考えごとをしたい午後に', null, '{"smoking_policy":"確認中"}'::jsonb, true),
  ((select id from public.place_categories where slug = 'jun-kissa'), '喫茶 栞', '東銀座駅', 5, 'https://www.google.com/maps/search/?api=1&query=%E5%96%AB%E8%8C%B6%20%E6%A0%9E%20%E6%9D%B1%E9%8A%80%E5%BA%A7', '静か', '全18席（カウンター6・テーブル12）', 'ひとりで過ごしやすい銀座の純喫茶', null, '{"smoking_policy":"確認中"}'::jsonb, true),
  ((select id from public.place_categories where slug = 'machi-chuka'), '中華 月星', '神保町駅', 3, 'https://www.google.com/maps/search/?api=1&query=%E4%B8%AD%E8%8F%AF%20%E6%9C%88%E6%98%9F%20%E7%A5%9E%E4%BF%9D%E7%94%BA', 'ほどよい賑わい', '全28席（カウンター10・テーブル18）', '炒飯と餃子で整える神保町の夜', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'machi-chuka'), '飯店 すずらん', '水道橋駅', 6, 'https://www.google.com/maps/search/?api=1&query=%E9%A3%AF%E5%BA%97%20%E3%81%99%E3%81%9A%E3%82%89%E3%82%93%20%E6%B0%B4%E9%81%93%E6%A9%8B', '静か', '全24席（カウンター8・テーブル16）', 'ひとりで入りやすい町中華の昼', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'machi-chuka'), '餃子と炒飯 燈火', '九段下駅', 5, 'https://www.google.com/maps/search/?api=1&query=%E9%A4%83%E5%AD%90%E3%81%A8%E7%82%92%E9%A3%AF%20%E7%87%88%E7%81%AB%20%E4%B9%9D%E6%AE%B5%E4%B8%8B', '賑やか', '全32席（カウンター12・テーブル20）', '餃子をつまみながら考えごとをほどく店', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'oufu-curry'), 'カレー舎 銀匙', '神保町駅', 4, 'https://www.google.com/maps/search/?api=1&query=%E3%82%AB%E3%83%AC%E3%83%BC%E8%88%8E%20%E9%8A%80%E5%8C%99%20%E7%A5%9E%E4%BF%9D%E7%94%BA', '静か', '全26席（カウンター8・テーブル18）', '本を買ったあとに寄りたい欧風カレー', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'oufu-curry'), '欧風カレー 花時計', '御茶ノ水駅', 6, 'https://www.google.com/maps/search/?api=1&query=%E6%AC%A7%E9%A2%A8%E3%82%AB%E3%83%AC%E3%83%BC%20%E8%8A%B1%E6%99%82%E8%A8%88%20%E5%BE%A1%E8%8C%B6%E3%83%8E%E6%B0%B4', 'ほどよい賑わい', '全28席（カウンター6・テーブル22）', '甘みとスパイスで気分を戻す昼', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'oufu-curry'), 'カレールーム 栞', '小川町駅', 5, 'https://www.google.com/maps/search/?api=1&query=%E3%82%AB%E3%83%AC%E3%83%BC%E3%83%AB%E3%83%BC%E3%83%A0%20%E6%A0%9E%20%E5%B0%8F%E5%B7%9D%E7%94%BA', '静か', '全22席（カウンター10・テーブル12）', 'ひとりで落ち着けるカレーの小部屋', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'vintage-clothes'), 'Vintage Letter', '高円寺駅', 4, 'https://www.google.com/maps/search/?api=1&query=Vintage%20Letter%20Koenji', '静か', '全8席（カウンター0・テーブル8）', '一生着たい服に出会う高円寺の古着屋', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'vintage-clothes'), 'Closet 麦', '高円寺駅', 6, 'https://www.google.com/maps/search/?api=1&query=Closet%20Mugi%20Koenji', 'ほどよい賑わい', '全10席（カウンター0・テーブル10）', 'ひとりでゆっくり試したい週末の一軒', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'vintage-clothes'), 'Archive Room', '阿佐ヶ谷駅', 5, 'https://www.google.com/maps/search/?api=1&query=Archive%20Room%20Asagaya', '静か', '全7席（カウンター0・テーブル7）', '古い服の質感を確かめる午後', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'work-friendly-cafe'), 'Desk Cafe 栞', '代々木上原駅', 3, 'https://www.google.com/maps/search/?api=1&query=Desk%20Cafe%20Shiori%20Yoyogi%20Uehara', '静か', '全30席（カウンター12・テーブル18）', '午前中に作業を進めたい日のカフェ', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'work-friendly-cafe'), 'Morning Table', '代々木公園駅', 6, 'https://www.google.com/maps/search/?api=1&query=Morning%20Table%20Tomigaya', 'ほどよい賑わい', '全26席（カウンター10・テーブル16）', '考えをノートに落とし込める朝の場所', null, '{}'::jsonb, true),
  ((select id from public.place_categories where slug = 'work-friendly-cafe'), 'Focus Room', '幡ヶ谷駅', 5, 'https://www.google.com/maps/search/?api=1&query=Focus%20Room%20Hatagaya', '静か', '全22席（カウンター8・テーブル14）', '静かにPCを開きたいひとり時間', null, '{}'::jsonb, true)
on conflict (category_id, name) do update set
  station = excluded.station,
  walk_minutes = excluded.walk_minutes,
  google_map_url = excluded.google_map_url,
  atmosphere = excluded.atmosphere,
  seat_info = excluded.seat_info,
  recommended_article = excluded.recommended_article,
  instagram_url = excluded.instagram_url,
  attributes = excluded.attributes,
  is_published = excluded.is_published;
