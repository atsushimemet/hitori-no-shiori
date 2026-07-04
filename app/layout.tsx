import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ひとりの栞",
  description: "今の気分からひとり時間を提案します",
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "ひとりの栞",
    capable: true,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5efe4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <header className="fixed inset-x-0 top-0 z-20 px-[var(--space-page-x)] py-4">
          <Link
            aria-label="トップページへ移動"
            className="inline-flex items-center font-serif text-base font-medium tracking-[0.08em] text-coffee transition-colors hover:text-seal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-seal"
            href="/"
          >
            ひとりの栞
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
