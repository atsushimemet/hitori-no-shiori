import "./globals.css";

export const metadata = {
  title: "ひとりの栞",
  description: "今の気分から、ひとり時間を提案するWebサービス。",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
