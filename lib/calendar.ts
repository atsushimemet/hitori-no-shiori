export type CreateCalendarEventParams = {
  datetimeText: string;
  placeName: string;
};

export async function createCalendarEvent(params: CreateCalendarEventParams) {
  void params;
  // TODO: Google Calendar API integration
  await new Promise((resolve) => window.setTimeout(resolve, 520));
  return { ok: true } as const;
}

export type GoogleCalendarLinkParams = {
  details?: string;
  location?: string;
  title: string;
};

// Google Calendar の「予定を作成」テンプレート画面を開く URL を組み立てる。
// OAuth を挟まずにブラウザ側で完結できるため、レコメンドカードの CTA から利用する。
export function buildGoogleCalendarUrl({ details, location, title }: GoogleCalendarLinkParams) {
  const params = new URLSearchParams({ action: "TEMPLATE", text: title });
  if (details) params.set("details", details);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
