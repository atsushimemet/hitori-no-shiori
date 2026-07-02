import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export default function WorkFriendlyCafePage() {
  return <PlaceListView category={placeCategories.workFriendlyCafe} />;
}
