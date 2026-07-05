export type GoogleCalendarLinkParams = {
  details?: string;
  // 開始時刻。指定すると dates パラメータが付き、予定がこの時刻で開かれる。
  start?: Date | null;
  // 終了時刻。省略時は開始の1時間後。
  end?: Date | null;
  location?: string;
  title: string;
};

const DEFAULT_EVENT_DURATION_MS = 60 * 60 * 1000;

// Google Calendar の dates パラメータ用に、端末ローカル時刻を YYYYMMDDTHHmmss へ整形する。
// タイムゾーン指定を付けないことで、ユーザーのカレンダー設定のタイムゾーンで解釈される。
function formatCalendarDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

// Google Calendar の「予定を作成」テンプレート画面を開く URL を組み立てる。
// OAuth を挟まずにブラウザ側で完結できるため、レコメンドカードの CTA から利用する。
export function buildGoogleCalendarUrl({
  details,
  end,
  location,
  start,
  title,
}: GoogleCalendarLinkParams) {
  const params = new URLSearchParams({ action: "TEMPLATE", text: title });
  if (details) params.set("details", details);
  if (location) params.set("location", location);
  if (start) {
    const endDate = end ?? new Date(start.getTime() + DEFAULT_EVENT_DURATION_MS);
    params.set("dates", `${formatCalendarDate(start)}/${formatCalendarDate(endDate)}`);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// 「今日 20:00」「明日 18時半」のような時間帯チップの文言を実際の日時に変換する。
// 解釈できない文言は null を返し、その場合は dates なし（従来挙動）にフォールバックする。
export function parsePlannedTimeText(text: string, now = new Date()): Date | null {
  const match = text.match(/(\d{1,2})(?::(\d{2})|時(半)?)/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : match[3] ? 30 : 0;
  if (hours > 23 || minutes > 59) return null;

  const date = new Date(now);
  date.setHours(hours, minutes, 0, 0);
  if (text.includes("明日")) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

// <input type="time"> の値（HH:MM）を今日の日時に変換する。
export function timeInputValueToDate(value: string, now = new Date()): Date | null {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;

  const date = new Date(now);
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}
