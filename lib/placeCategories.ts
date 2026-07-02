export type PlaceAttributeDefinition = {
  key: string;
  label: string;
};

export type Place = {
  attributes?: Record<string, string>;
  counterSeats?: number;
  googleMapUrl?: string;
  id?: string;
  instagramUrl?: string;
  mapUrl?: string;
  name: string;
  recommendedArticle: string;
  recommendedArticleUrl?: string;
  seatInfo?: string;
  station: string;
  tableSeats?: number;
  totalSeats?: number;
  walkMinutes: number;
};

export type PlaceCategoryId =
  | "bookstore"
  | "casualBar"
  | "casualBistro"
  | "hashiyaPasta"
  | "junKissa"
  | "machiChuka"
  | "oufuCurry"
  | "vintageClothes"
  | "workFriendlyCafe";

export type PlaceCategoryConfig = {
  assistantListMessage: string;
  assistantQuestion: string;
  attributeSchema?: PlaceAttributeDefinition[];
  calendarPlaceLabel: string;
  description: string;
  heading: string;
  id: PlaceCategoryId;
  interestTarget: string;
  keywords: string[];
  label: string;
  places: Place[];
  route: string;
  selectPrompt: string;
  slug: string;
  timeOptions: readonly string[];
  timePlaceholder: string;
};

function mapSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const placeCategories = {
  bookstore: {
    assistantListMessage: "神保町で、目的を決めずに歩ける本屋をリストアップしました。",
    assistantQuestion: "本屋さんですね。どのあたりで歩きたいですか？",
    calendarPlaceLabel: "本屋",
    description: "神保町で、棚を眺めながらひとり時間を過ごせる場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうな本屋を三軒。",
    id: "bookstore",
    interestTarget: "本屋",
    keywords: ["本屋", "書店", "本", "ブックストア"],
    label: "本屋",
    places: [
      {
        counterSeats: 0,
        mapUrl: mapSearch("Book Room Shiori Jimbocho"),
        name: "Book Room 栞",
        recommendedArticle: "買う本を決めずに歩きたい神保町の本屋",
        station: "神保町駅",
        tableSeats: 10,
        totalSeats: 10,
        walkMinutes: 3,
      },
      {
        counterSeats: 0,
        mapUrl: mapSearch("Bookshelf Mado Ochanomizu"),
        name: "Bookshelf 窓",
        recommendedArticle: "新しい棚に出会える週末の書店案内",
        station: "御茶ノ水駅",
        tableSeats: 8,
        totalSeats: 8,
        walkMinutes: 6,
      },
      {
        counterSeats: 0,
        mapUrl: mapSearch("Kotoba no Mori Jimbocho"),
        name: "ことばの森",
        recommendedArticle: "ひとりで選ぶ時間を大切にできる本屋",
        station: "神保町駅",
        tableSeats: 12,
        totalSeats: 12,
        walkMinutes: 5,
      },
    ],
    route: "/bookstore",
    selectPrompt: "どの本屋に行ってみたいですか？",
    slug: "bookstore",
    timeOptions: ["今日 15:00", "今日 18:00"],
    timePlaceholder: "例：今日の15時",
  },
  casualBar: {
    assistantListMessage: "恵比寿ですね、以下のバーをリストアップしました。",
    assistantQuestion: "近所のバーですね、場所はどちらを希望されますか？",
    attributeSchema: [{ key: "price_range", label: "価格帯" }],
    calendarPlaceLabel: "お店",
    description: "恵比寿で、静かに過ごせる場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうなバーを三軒。",
    id: "casualBar",
    interestTarget: "お店",
    keywords: ["バー", "bar"],
    label: "カジュアルバー",
    places: [
      {
        attributes: { price_range: "確認中" },
        counterSeats: 8,
        mapUrl: mapSearch("Bar Amber Note Ebisu"),
        name: "Bar Amber Note",
        recommendedArticle: "恵比寿で静かに飲めるカジュアルバー",
        station: "恵比寿駅",
        tableSeats: 10,
        totalSeats: 18,
        walkMinutes: 3,
      },
      {
        attributes: { price_range: "確認中" },
        counterSeats: 10,
        mapUrl: mapSearch("Evening Stand Ebisu"),
        name: "Evening Stand Ebisu",
        recommendedArticle: "仕事帰りに寄りたい恵比寿のバー",
        station: "恵比寿駅",
        tableSeats: 14,
        totalSeats: 24,
        walkMinutes: 5,
      },
      {
        attributes: { price_range: "確認中" },
        counterSeats: 6,
        mapUrl: mapSearch("Book & Glass Ebisu"),
        name: "Book & Glass Ebisu",
        recommendedArticle: "ひとりで過ごしやすい夜の隠れ家",
        station: "恵比寿駅",
        tableSeats: 6,
        totalSeats: 12,
        walkMinutes: 7,
      },
    ],
    route: "/casual-bar",
    selectPrompt: "どのお店に行ってみたいですか？",
    slug: "casual-bar",
    timeOptions: ["今日 19:00", "今日 20:00"],
    timePlaceholder: "例：今日の20時",
  },
  casualBistro: {
    assistantListMessage: "代々木上原で、ひとりでも入りやすいビストロをリストアップしました。",
    assistantQuestion: "カジュアルなビストロですね。どのあたりで探しますか？",
    calendarPlaceLabel: "お店",
    description: "代々木上原で、肩肘張らずに食事できる場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうなビストロを三軒。",
    id: "casualBistro",
    interestTarget: "お店",
    keywords: ["カジュアルビストロ", "ビストロ", "フレンチ"],
    label: "カジュアルビストロ",
    places: [
      {
        counterSeats: 6,
        mapUrl: mapSearch("Bistro Note Yoyogi Uehara"),
        name: "Bistro Note",
        recommendedArticle: "ひとりで寄れる小さなビストロ案内",
        station: "代々木上原駅",
        tableSeats: 16,
        totalSeats: 22,
        walkMinutes: 4,
      },
      {
        counterSeats: 8,
        mapUrl: mapSearch("Table Souffle Yoyogi Uehara"),
        name: "Table Souffle",
        recommendedArticle: "気軽な一皿で夜を整える店",
        station: "代々木上原駅",
        tableSeats: 20,
        totalSeats: 28,
        walkMinutes: 5,
      },
      {
        counterSeats: 5,
        mapUrl: mapSearch("Bistro Kashiwa Tomigaya"),
        name: "Bistro 柏",
        recommendedArticle: "富ヶ谷で静かに食事したい日に",
        station: "代々木公園駅",
        tableSeats: 14,
        totalSeats: 19,
        walkMinutes: 7,
      },
    ],
    route: "/casual-bistro",
    selectPrompt: "どのビストロに行ってみたいですか？",
    slug: "casual-bistro",
    timeOptions: ["今日 18:30", "今日 20:00"],
    timePlaceholder: "例：今日の19時半",
  },
  hashiyaPasta: {
    assistantListMessage: "代々木八幡で、ハシヤ系パスタの気分に合う店をリストアップしました。",
    assistantQuestion: "ハシヤ系パスタですね。行きやすいエリアはありますか？",
    calendarPlaceLabel: "お店",
    description: "代々木八幡で、和風パスタをゆっくり楽しめる場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうなパスタを三軒。",
    id: "hashiyaPasta",
    interestTarget: "お店",
    keywords: ["ハシヤ", "パスタ", "スパゲッティ", "スパゲティ"],
    label: "ハシヤ系パスタ",
    places: [
      {
        counterSeats: 7,
        mapUrl: mapSearch("Pasta Hashi Note Yoyogi Hachiman"),
        name: "Pasta Hashi Note",
        recommendedArticle: "たらこスパゲッティを静かに食べたい日",
        station: "代々木八幡駅",
        tableSeats: 12,
        totalSeats: 19,
        walkMinutes: 3,
      },
      {
        counterSeats: 10,
        mapUrl: mapSearch("Spaghetti Kissa Mugi Yoyogi Koen"),
        name: "スパゲッティ喫茶 麦",
        recommendedArticle: "和風パスタでひと息つく昼",
        station: "代々木公園駅",
        tableSeats: 10,
        totalSeats: 20,
        walkMinutes: 5,
      },
      {
        counterSeats: 6,
        mapUrl: mapSearch("Hashiya Style Pasta Tomigaya"),
        name: "橋の皿",
        recommendedArticle: "納豆ときのこのパスタが似合う午後",
        station: "代々木上原駅",
        tableSeats: 14,
        totalSeats: 20,
        walkMinutes: 8,
      },
    ],
    route: "/hashiya-pasta",
    selectPrompt: "どのパスタ店に行ってみたいですか？",
    slug: "hashiya-pasta",
    timeOptions: ["今日 13:00", "今日 18:30"],
    timePlaceholder: "例：今日の13時",
  },
  junKissa: {
    assistantListMessage: "銀座で静かに過ごせる喫茶店をリストアップしました。",
    assistantQuestion: "静かな喫茶店ですね。場所はどちらを希望されますか？",
    attributeSchema: [{ key: "smoking_policy", label: "喫煙可否" }],
    calendarPlaceLabel: "喫茶店",
    description: "銀座で、静かに過ごせる場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうな喫茶店を三軒。",
    id: "junKissa",
    interestTarget: "喫茶店",
    keywords: ["喫茶店", "カフェ"],
    label: "純喫茶",
    places: [
      {
        attributes: { smoking_policy: "確認中" },
        counterSeats: 4,
        mapUrl: mapSearch("喫茶 月灯 銀座"),
        name: "喫茶 月灯",
        recommendedArticle: "銀座で本を読みたい静かな喫茶店",
        station: "銀座駅",
        tableSeats: 18,
        totalSeats: 22,
        walkMinutes: 3,
      },
      {
        attributes: { smoking_policy: "確認中" },
        counterSeats: 6,
        mapUrl: mapSearch("銀座 珈琲室 燈"),
        name: "銀座 珈琲室 燈",
        recommendedArticle: "銀座で考えごとをしたい午後に",
        station: "銀座一丁目駅",
        tableSeats: 24,
        totalSeats: 30,
        walkMinutes: 4,
      },
      {
        attributes: { smoking_policy: "確認中" },
        counterSeats: 6,
        mapUrl: mapSearch("喫茶 栞 東銀座"),
        name: "喫茶 栞",
        recommendedArticle: "ひとりで過ごしやすい銀座の純喫茶",
        station: "東銀座駅",
        tableSeats: 12,
        totalSeats: 18,
        walkMinutes: 5,
      },
    ],
    route: "/jun-kissa",
    selectPrompt: "どの喫茶店に行ってみたいですか？",
    slug: "jun-kissa",
    timeOptions: ["今日 14:00", "今日 16:00"],
    timePlaceholder: "例：今日の16時",
  },
  machiChuka: {
    assistantListMessage: "神保町で、ひとりでも入りやすい町中華をリストアップしました。",
    assistantQuestion: "町中華ですね。どのあたりで探しますか？",
    calendarPlaceLabel: "お店",
    description: "神保町で、気軽に一皿を楽しめる場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうな町中華を三軒。",
    id: "machiChuka",
    interestTarget: "お店",
    keywords: ["町中華", "中華", "餃子", "炒飯", "チャーハン", "ラーメン"],
    label: "町中華",
    places: [
      {
        counterSeats: 10,
        mapUrl: mapSearch("中華 月星 神保町"),
        name: "中華 月星",
        recommendedArticle: "炒飯と餃子で整える神保町の夜",
        station: "神保町駅",
        tableSeats: 18,
        totalSeats: 28,
        walkMinutes: 3,
      },
      {
        counterSeats: 8,
        mapUrl: mapSearch("飯店 すずらん 水道橋"),
        name: "飯店 すずらん",
        recommendedArticle: "ひとりで入りやすい町中華の昼",
        station: "水道橋駅",
        tableSeats: 16,
        totalSeats: 24,
        walkMinutes: 6,
      },
      {
        counterSeats: 12,
        mapUrl: mapSearch("餃子と炒飯 燈火 九段下"),
        name: "餃子と炒飯 燈火",
        recommendedArticle: "餃子をつまみながら考えごとをほどく店",
        station: "九段下駅",
        tableSeats: 20,
        totalSeats: 32,
        walkMinutes: 5,
      },
    ],
    route: "/machi-chuka",
    selectPrompt: "どの町中華に行ってみたいですか？",
    slug: "machi-chuka",
    timeOptions: ["今日 12:30", "今日 19:00"],
    timePlaceholder: "例：今日の19時",
  },
  oufuCurry: {
    assistantListMessage: "神保町で、ひとり時間に合う欧風カレーをリストアップしました。",
    assistantQuestion: "欧風カレーですね。どのあたりで探しますか？",
    calendarPlaceLabel: "お店",
    description: "神保町で、ゆっくり味わえるカレーの場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうな欧風カレーを三軒。",
    id: "oufuCurry",
    interestTarget: "お店",
    keywords: ["欧風カレー", "カレー"],
    label: "欧風カレー",
    places: [
      {
        counterSeats: 8,
        mapUrl: mapSearch("カレー舎 銀匙 神保町"),
        name: "カレー舎 銀匙",
        recommendedArticle: "本を買ったあとに寄りたい欧風カレー",
        station: "神保町駅",
        tableSeats: 18,
        totalSeats: 26,
        walkMinutes: 4,
      },
      {
        counterSeats: 6,
        mapUrl: mapSearch("欧風カレー 花時計 御茶ノ水"),
        name: "欧風カレー 花時計",
        recommendedArticle: "甘みとスパイスで気分を戻す昼",
        station: "御茶ノ水駅",
        tableSeats: 22,
        totalSeats: 28,
        walkMinutes: 6,
      },
      {
        counterSeats: 10,
        mapUrl: mapSearch("カレールーム 栞 小川町"),
        name: "カレールーム 栞",
        recommendedArticle: "ひとりで落ち着けるカレーの小部屋",
        station: "小川町駅",
        tableSeats: 12,
        totalSeats: 22,
        walkMinutes: 5,
      },
    ],
    route: "/oufu-curry",
    selectPrompt: "どのカレー店に行ってみたいですか？",
    slug: "oufu-curry",
    timeOptions: ["今日 13:00", "今日 18:30"],
    timePlaceholder: "例：今日の18時半",
  },
  vintageClothes: {
    assistantListMessage: "高円寺で、ひとりでじっくり見られる古着屋をリストアップしました。",
    assistantQuestion: "古着ですね。どのあたりで探したいですか？",
    calendarPlaceLabel: "古着屋",
    description: "高円寺で、長く着たい一着を探せる場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうな古着屋を三軒。",
    id: "vintageClothes",
    interestTarget: "古着屋",
    keywords: ["古着", "ヴィンテージ", "ビンテージ", "服", "洋服"],
    label: "古着",
    places: [
      {
        counterSeats: 0,
        mapUrl: mapSearch("Vintage Letter Koenji"),
        name: "Vintage Letter",
        recommendedArticle: "一生着たい服に出会う高円寺の古着屋",
        station: "高円寺駅",
        tableSeats: 8,
        totalSeats: 8,
        walkMinutes: 4,
      },
      {
        counterSeats: 0,
        mapUrl: mapSearch("Closet Mugi Koenji"),
        name: "Closet 麦",
        recommendedArticle: "ひとりでゆっくり試したい週末の一軒",
        station: "高円寺駅",
        tableSeats: 10,
        totalSeats: 10,
        walkMinutes: 6,
      },
      {
        counterSeats: 0,
        mapUrl: mapSearch("Archive Room Asagaya"),
        name: "Archive Room",
        recommendedArticle: "古い服の質感を確かめる午後",
        station: "阿佐ヶ谷駅",
        tableSeats: 7,
        totalSeats: 7,
        walkMinutes: 5,
      },
    ],
    route: "/vintage-clothes",
    selectPrompt: "どの古着屋に行ってみたいですか？",
    slug: "vintage-clothes",
    timeOptions: ["今日 13:00", "今日 16:00"],
    timePlaceholder: "例：今日の16時",
  },
  workFriendlyCafe: {
    assistantListMessage: "代々木上原で、作業がはかどる場所をリストアップしました。",
    assistantQuestion: "作業がはかどる場所ですね。どのあたりで探しますか？",
    calendarPlaceLabel: "場所",
    description: "代々木上原で、午前中から集中しやすい場所を選びました。",
    heading: "今日のひとり時間に、\n合いそうな作業場所を三軒。",
    id: "workFriendlyCafe",
    interestTarget: "場所",
    keywords: ["作業", "仕事", "集中", "pc", "PC", "電源", "wifi", "Wi-Fi", "ワイファイ"],
    label: "作業向きカフェ",
    places: [
      {
        counterSeats: 12,
        mapUrl: mapSearch("Desk Cafe Shiori Yoyogi Uehara"),
        name: "Desk Cafe 栞",
        recommendedArticle: "午前中に作業を進めたい日のカフェ",
        station: "代々木上原駅",
        tableSeats: 18,
        totalSeats: 30,
        walkMinutes: 3,
      },
      {
        counterSeats: 10,
        mapUrl: mapSearch("Morning Table Tomigaya"),
        name: "Morning Table",
        recommendedArticle: "考えをノートに落とし込める朝の場所",
        station: "代々木公園駅",
        tableSeats: 16,
        totalSeats: 26,
        walkMinutes: 6,
      },
      {
        counterSeats: 8,
        mapUrl: mapSearch("Focus Room Hatagaya"),
        name: "Focus Room",
        recommendedArticle: "静かにPCを開きたいひとり時間",
        station: "幡ヶ谷駅",
        tableSeats: 14,
        totalSeats: 22,
        walkMinutes: 5,
      },
    ],
    route: "/work-friendly-cafe",
    selectPrompt: "どの場所に行ってみたいですか？",
    slug: "work-friendly-cafe",
    timeOptions: ["今日 10:00", "今日 13:00"],
    timePlaceholder: "例：今日の10時",
  },
} satisfies Record<PlaceCategoryId, PlaceCategoryConfig>;

const routingCategories: PlaceCategoryConfig[] = [
  placeCategories.bookstore,
  placeCategories.workFriendlyCafe,
  placeCategories.vintageClothes,
  placeCategories.machiChuka,
  placeCategories.oufuCurry,
  placeCategories.casualBistro,
  placeCategories.hashiyaPasta,
  placeCategories.junKissa,
  placeCategories.casualBar,
];

export function resolvePlaceCategoryForMessage(message: string): PlaceCategoryConfig {
  const normalizedMessage = message.toLowerCase();

  return (
    routingCategories.find((category) =>
      category.keywords.some((keyword) => normalizedMessage.includes(keyword.toLowerCase())),
    ) ?? placeCategories.casualBar
  );
}
