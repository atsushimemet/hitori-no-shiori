import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export default function VintageClothesPage() {
  return <PlaceListView category={placeCategories.vintageClothes} />;
}
