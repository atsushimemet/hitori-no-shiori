import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export default function HashiyaPastaPage() {
  return <PlaceListView category={placeCategories.hashiyaPasta} />;
}
