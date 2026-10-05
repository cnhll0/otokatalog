import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OtoKatalog | Türkiye'nin Dijital Çıkma Yedek Parça Envanteri",
  description: "Marka, model ve OEM koduna göre uyumlu, garantili orijinal çıkma oto yedek parçaları. Hızlı kargo, güvenli sipariş.",
  keywords: ["otokatalog", "çıkma yedek parça", "orijinal çıkma", "oto parça sorgulama", "oem parça bul"],
  openGraph: {
    title: "OtoKatalog - Dijital Çıkma Yedek Parça Pazarı",
    description: "Binlerce araç modeli için test edilmiş çıkma yedek parça kataloğu.",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}