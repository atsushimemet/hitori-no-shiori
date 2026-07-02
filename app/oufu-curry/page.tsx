import { PlaceListView } from "@/components/place/PlaceListView";
import { getRandomPlacesByCategorySlug } from "@/lib/places";
import { placeCategories } from "@/lib/placeCategories";

export const dynamic = "force-dynamic";

export default async function OufuCurryPage() {
  const category = await getRandomPlacesByCategorySlug(placeCategories.oufuCurry);

  return <PlaceListView category={category} />;
}
