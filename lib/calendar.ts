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
