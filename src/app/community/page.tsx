import Spotlight from "@/app/components/Spotlight";
import type { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "आलमनगर समुदाय - स्पॉटलाइट | Alamnagar Community Spotlight",
  description: "आलमनगर का आधिकारिक समुदाय स्पॉटलाइट। अपने विचार, तस्वीरें और वीडियो साझा करें। लाइक, कमेंट, शेयर करें और गाँव से जुड़े रहें।",
  keywords: ["आलमनगर", "समुदाय", "स्पॉटलाइट", "मधेपुरा", "बिहार", "Alamnagar Community"],
};

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <Spotlight />
    </main>
  );
}