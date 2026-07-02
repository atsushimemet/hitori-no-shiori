import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export default function CasualBistroPage() {
  return <PlaceListView category={placeCategories.casualBistro} />;
}
