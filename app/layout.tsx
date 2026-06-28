import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ひとりの栞",
  description: "今の気分からひとり時間を提案します",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
