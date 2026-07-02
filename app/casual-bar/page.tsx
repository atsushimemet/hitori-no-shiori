import { PlaceListView } from "@/components/place/PlaceListView";
import { getRandomPlacesByCategorySlug } from "@/lib/places";
import { placeCategories } from "@/lib/placeCategories";

export const dynamic = "force-dynamic";

export default async function CasualBarPage() {
  const category = await getRandomPlacesByCategorySlug(placeCategories.casualBar);

  return <PlaceListView category={category} />;
}
