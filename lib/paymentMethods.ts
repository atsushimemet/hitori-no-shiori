// 決済方法のカタログ（単一の情報源）。
//
// 新しい決済手段を増やしたいときは、この配列に1行追加するだけでよい。
// 追加した手段は型補完・表示順・重複防止にそのまま反映される。
// ここに無い未知の手段（将来登場する決済など）も、下の PaymentMethod 型が
// 任意の文字列を許容するため、そのまま保持・表示できる（表示は末尾に回る）。
//
// 並び順は「現金 → カード → 交通系 → タッチ決済 → QRコード決済」の順に
// 表示されるよう、この配列の並びがそのまま表示順になる。
export const PAYMENT_METHODS = [
  "現金",
  "クレジットカード",
  "デビットカード",
  "交通系IC",
  "iD",
  "QUICPay",
  "PayPay",
  "楽天ペイ",
  "d払い",
  "au PAY",
  "LINE Pay",
  "メルペイ",
] as const;

// 既知の決済手段は入力補完が効きつつ、カタログ外の未知の文字列も許容する。
// （`string & {}` は string リテラル補完を潰さずに string を受け入れる定石）
export type PaymentMethod = (typeof PAYMENT_METHODS)[number] | (string & {});

const catalogOrder = new Map<string, number>(
  PAYMENT_METHODS.map((method, index) => [method, index] as const),
);

// カタログ順に並べ替える。カタログに無い未知の手段は末尾へ回し、
// 未知同士は元の並び順を保つ（Array.prototype.sort は安定ソート）。
export function orderPaymentMethods(methods: readonly string[]): string[] {
  return [...methods].sort((a, b) => {
    const orderA = catalogOrder.get(a) ?? Number.POSITIVE_INFINITY;
    const orderB = catalogOrder.get(b) ?? Number.POSITIVE_INFINITY;

    return orderA - orderB;
  });
}
