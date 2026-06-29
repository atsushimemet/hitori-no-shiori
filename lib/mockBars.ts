export type MockBar = {
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

export const mockBars: MockBar[] = [
  {
    atmosphere: "静か",
    counterSeats: 8,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Bar%20Amber%20Note%20Ebisu",
    name: "Bar Amber Note",
    recommendedArticle: "恵比寿で静かに飲めるカジュアルバー",
    station: "恵比寿駅",
    tableSeats: 10,
    totalSeats: 18,
    walkMinutes: 3,
  },
  {
    atmosphere: "ほどよい賑わい",
    counterSeats: 10,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Evening%20Stand%20Ebisu",
    name: "Evening Stand Ebisu",
    recommendedArticle: "仕事帰りに寄りたい恵比寿のバー",
    station: "恵比寿駅",
    tableSeats: 14,
    totalSeats: 24,
    walkMinutes: 5,
  },
  {
    atmosphere: "静か",
    counterSeats: 6,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Book%20%26%20Glass%20Ebisu",
    name: "Book & Glass Ebisu",
    recommendedArticle: "ひとりで過ごしやすい夜の隠れ家",
    station: "恵比寿駅",
    tableSeats: 6,
    totalSeats: 12,
    walkMinutes: 7,
  },
];
