export type PlaceSearchParams = Promise<{ station?: string | string[] }>;

export async function getRequestedStation(searchParams?: PlaceSearchParams): Promise<string | undefined> {
  const params = await searchParams;
  const station = Array.isArray(params?.station) ? params.station[0] : params?.station;

  return station?.trim() || undefined;
}
