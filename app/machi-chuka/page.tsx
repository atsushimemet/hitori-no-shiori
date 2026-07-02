import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export default function MachiChukaPage() {
  return <PlaceListView category={placeCategories.machiChuka} />;
}
