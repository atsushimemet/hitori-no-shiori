import { PlaceListView } from "@/components/place/PlaceListView";
import { getRandomPlacesByCategorySlug } from "@/lib/places";
import { placeCategories } from "@/lib/placeCategories";
import { getRequestedStation, type PlaceSearchParams } from "@/lib/searchParams";

export const dynamic = "force-dynamic";

type VintageClothesPageProps = {
  searchParams?: PlaceSearchParams;
};

export default async function VintageClothesPage({ searchParams }: VintageClothesPageProps) {
  const requestedStation = await getRequestedStation(searchParams);
  const category = await getRandomPlacesByCategorySlug(placeCategories.vintageClothes, 3, requestedStation);

  return <PlaceListView category={category} requestedStation={requestedStation} />;
}
