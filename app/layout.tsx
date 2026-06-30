import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rose | Bakery, pastries and custom cakes",
  description: "Bilingual pastry and food ordering PWA for pickup and delivery requests.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#E8A7B7"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
