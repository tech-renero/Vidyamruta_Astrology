import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Vidyamruta — Vedic Astrology Platform",
  description:
    "Unveil the cosmic blueprint of your destiny. Generate precise Kundli charts, explore daily horoscopes, Ashtakoota matchmaking, and connect with expert Vedic astrologers.",
  keywords: "Vedic Astrology, Kundli, Horoscope, Panchang, Jyotish, Birth Chart, Ashtakoota Matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: '#ffffff' }}>
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
