"use client";

import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export function JunKissaView() {
  return <PlaceListView category={placeCategories.junKissa} />;
}
