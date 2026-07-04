-- 近隣エリア補完の動作を実際の画面（/casual-bar など）で確認できるようにするための seed 調整。
--
-- 背景：カジュアルバーは指定エリア「恵比寿」に3店舗あり、そのままでは補完が発生しない。
-- そこで恵比寿の3店舗のうち1店舗（Book & Glass Ebisu）を近隣エリア「代官山」に移設する。
-- これにより恵比寿の公開店舗は2件（<3件）になり、
-- 近隣エリア「代官山」から1件が補完され、その店舗に「近隣エリアから補完」バッジが付く。
--
-- 近隣エリアの定義（恵比寿→代官山）は lib/areaProximity.ts と対応している。
update public.places
set
  station = '代官山駅',
  google_map_url = 'https://www.google.com/maps/search/?api=1&query=Book%20%26%20Glass%20Daikanyama',
  recommended_article = '代官山で静かに過ごせる夜の隠れ家'
where name = 'Book & Glass Ebisu';
