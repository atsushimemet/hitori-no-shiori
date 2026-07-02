"use client";

import { PlaceListView } from "@/components/place/PlaceListView";
import { placeCategories } from "@/lib/placeCategories";

export function CasualBarView() {
  return <PlaceListView category={placeCategories.casualBar} />;
}
