export type MockKissa = {
  atmosphere: "静か" | "ほどよい賑わい" | "賑やか";
  counterSeats: number;
  mapUrl: string;
  name: string;
  recommendedArticle: string;
  station: string;
  tableSeats: number;
  totalSeats: number;
  walkMinutes: number;
};

export const mockKissas: MockKissa[] = [
  {
    atmosphere: "静か",
    counterSeats: 4,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%96%AB%E8%8C%B6%20%E6%9C%88%E7%81%AF%20%E9%8A%80%E5%BA%A7",
    name: "喫茶 月灯",
    recommendedArticle: "銀座で本を読みたい静かな喫茶店",
    station: "銀座駅",
    tableSeats: 18,
    totalSeats: 22,
    walkMinutes: 3,
  },
  {
    atmosphere: "ほどよい賑わい",
    counterSeats: 6,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%8A%80%E5%BA%A7%20%E7%8F%88%E7%90%B2%E5%AE%A4%20%E7%87%88",
    name: "銀座 珈琲室 燈",
    recommendedArticle: "銀座で考えごとをしたい午後に",
    station: "銀座一丁目駅",
    tableSeats: 24,
    totalSeats: 30,
    walkMinutes: 4,
  },
  {
    atmosphere: "静か",
    counterSeats: 6,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%96%AB%E8%8C%B6%20%E6%A0%9E%20%E6%9D%B1%E9%8A%80%E5%BA%A7",
    name: "喫茶 栞",
    recommendedArticle: "ひとりで過ごしやすい銀座の純喫茶",
    station: "東銀座駅",
    tableSeats: 12,
    totalSeats: 18,
    walkMinutes: 5,
  },
];
