import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export default function BookstorePage() {
  return <PlaceListView category={placeCategories.bookstore} />;
}
