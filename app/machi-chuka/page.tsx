import { PlaceListView } from "@/components/place/PlaceListView";
import { getRandomPlacesByCategorySlug } from "@/lib/places";
import { placeCategories } from "@/lib/placeCategories";

export const dynamic = "force-dynamic";

export default async function MachiChukaPage() {
  const category = await getRandomPlacesByCategorySlug(placeCategories.machiChuka);

  return <PlaceListView category={category} />;
}
