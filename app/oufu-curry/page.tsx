import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export default function OufuCurryPage() {
  return <PlaceListView category={placeCategories.oufuCurry} />;
}
