import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "आलमनगर, मधेपुरा, बिहार — हमारा गाँव, हमारी पहचान",
  description: "आलमनगर गाँव का आधिकारिक डिजिटल प्लेटफॉर्म। इतिहास, संस्कृति, समुदाय और स्थानीय बाज़ार एक ही जगह पर।",
  keywords: ["आलमनगर", "मधेपुरा", "बिहार गाँव", "मिथिला"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className={`${inter.className} bg-stone-50 text-stone-900 antialiased`}>
        <Navbar />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}