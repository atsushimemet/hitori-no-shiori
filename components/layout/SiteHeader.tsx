"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  // トップページでは戻る導線が不要なので「ひとりの栞」を表示しない
  if (pathname === "/") {
    return null;
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 px-[var(--space-page-x)] py-4">
      <Link
        aria-label="トップページへ移動"
        className="pointer-events-auto inline-flex items-center font-serif text-base font-medium tracking-[0.08em] text-coffee transition-colors hover:text-seal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-seal"
        href="/"
      >
        ひとりの栞
      </Link>
    </header>
  );
}
