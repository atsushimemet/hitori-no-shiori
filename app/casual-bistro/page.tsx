import { PlaceListView } from "@/components/place/PlaceListView";
import { getRandomPlacesByCategorySlug } from "@/lib/places";
import { placeCategories } from "@/lib/placeCategories";
import { getRequestedStation, type PlaceSearchParams } from "@/lib/searchParams";

export const dynamic = "force-dynamic";

type CasualBistroPageProps = {
  searchParams?: PlaceSearchParams;
};

export default async function CasualBistroPage({ searchParams }: CasualBistroPageProps) {
  const requestedStation = await getRequestedStation(searchParams);
  const category = await getRandomPlacesByCategorySlug(placeCategories.casualBistro, 3, requestedStation);

  return <PlaceListView category={category} requestedStation={requestedStation} />;
}
