import { Bookmark } from "lucide-react";

export function BookmarkIntro() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-md border border-coffee/20 bg-white/70 text-coffee shadow-soft">
      <Bookmark aria-hidden="true" size={26} strokeWidth={1.7} />
    </div>
  );
}
