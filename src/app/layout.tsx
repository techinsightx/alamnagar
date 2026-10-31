import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// ✅ PWA Provider Import
import PWAProvider from "./components/PWAProvider";

// ==================== FONTS (Hindi + English) ====================
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const notoSansDevanagari = Noto_Sans_Devanagari({ 
  subsets: ["devanagari"],
  variable: '--font-noto-sans-devanagari',
  display: 'swap',
  preload: true,
});

// ==================== CORE CONFIG ====================
const SITE_URL = 'https://alamnagar.in';
const FOUNDER_NAME = 'Mukesh Kumar Malakar';
const CREATERA_URL = 'https://createra.in';

// ⚠️ TODO: Replace these with your actual Google Analytics & GTM IDs
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'; 
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX';

// ==================== HERO MESSAGING ====================
const HERO_TAGLINE = "आलमनगर: जड़ों से जुड़ा, मिथिला की धरती का गौरव। हमारा गाँव, हमारी पहचान, हमारा डिजिटल चौपाल।";

// ==================== WORLD-CLASS METADATA ====================
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Alamnagar.in | आलमनगर, मधेपुरा का आधिकारिक डिजिटल प्लेटफॉर्म",
    template: "%s | Alamnagar - मिथिला की धरती का गौरव",
  },
  description: "Alamnagar.in is the official digital platform of Alamnagar, Madhepura, Bihar. Founded by Mukesh Kumar Malakar (Founder of Createra.in). Connect with the Mithila community, explore local culture, marketplace, and village heritage.",
  keywords: [
    "Alamnagar", "Alamnagar Madhepura", "Alamnagar Bihar", "Alamnagar.in",
    "Mithila culture", "Mithilaanchal digital", "Alamnagar news", 
    "Alamnagar marketplace", "Mukesh Kumar Malakar", "Createra founder",
    "Bihar village community", "Hariballabh Chowk Alamnagar",
    "आलमनगर", "मधेपुरा", "मिथिला संस्कृति", "बिहार गाँव", "मुखेश कुमार मलाकार"
  ],
  authors: [{ name: FOUNDER_NAME, url: CREATERA_URL }],
  creator: FOUNDER_NAME,
  publisher: "Alamnagar Digital",
  applicationName: "Alamnagar",
  generator: "Next.js 15",
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'hi-IN': SITE_URL,
      'en-IN': `${SITE_URL}/en`, // Future-proofing for English version
    }
  },
  verification: {
    google: 'guXiWsyDznzmNeQ9wBA6NfiPp0AuDW7QYT7TJDlDFKE', // ✅ Your verified code
  },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    url: SITE_URL,
    siteName: "Alamnagar.in",
    title: "Alamnagar | आलमनगर - मिथिला की धरती का गौरव",
    description: HERO_TAGLINE,
    images: [
      { 
        url: `${SITE_URL}/og-cover.png`, // 🔥 Absolute URL for better social scraping
        width: 1200, 
        height: 630, 
        alt: "Alamnagar - जड़ों से जुड़ा, मिथिला की धरती का गौरव", 
        type: "image/png" 
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@alamnagar_in",
    creator: "@createra_in", 
    title: "Alamnagar | आलमनगर - मिथिला की धरती का गौरव",
    description: HERO_TAGLINE,
    images: [`${SITE_URL}/og-cover.png`],
  },
  category: "Community & Local Culture",
  classification: "Indian Village Community & Digital Empowerment Platform",
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: { 
    capable: true, 
    statusBarStyle: "black-translucent", 
    title: "Alamnagar" 
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon-maskable-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    'author': `${FOUNDER_NAME} (Founder of Createra.in & Alamnagar.in)`,
    'copyright': `© ${new Date().getFullYear()} Alamnagar.in. All rights reserved.`,
    'geo.region': 'IN-BR',
    'geo.placename': 'Alamnagar, Madhepura',
    'geo.position': '25.9333;86.1167',
    'ICBM': '25.9333, 86.1167',
    'rating': 'general',
    'distribution': 'global',
    'revisit-after': '3 days',
    'business:country': 'India',
    'platform:type': 'Community & Local Culture',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" }, 
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" }, 
  ],
  colorScheme: "dark light",
};

// ==================== ADVANCED STRUCTURED DATA (JSON-LD) ====================

// 🔥 1. FOUNDER PERSON SCHEMA (E-E-A-T Authority Booster)
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}#founder`,
  "name": FOUNDER_NAME,
  "url": CREATERA_URL,
  "jobTitle": "Founder & Tech Visionary",
  "worksFor": [
    { "@type": "Organization", "name": "Createra", "url": CREATERA_URL },
    { "@type": "Organization", "name": "Alamnagar Digital", "url": SITE_URL }
  ],
  "description": "Mukesh Kumar Malakar is a visionary tech entrepreneur, founder of Createra.in, and the digital architect behind Alamnagar.in, dedicated to rural empowerment and Mithila cultural preservation in Bihar.",
  "knowsAbout": ["Creator Economy", "Web Development", "Digital Empowerment", "Rural Innovation", "Mithila Culture"],
  "sameAs": [CREATERA_URL, SITE_URL, "https://www.linkedin.com/in/your-profile"] // ⚠️ Add your LinkedIn/Twitter here
};

// 🔥 2. ORGANIZATION SCHEMA
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}#organization`,
  "name": "Alamnagar Digital",
  "alternateName": "Alamnagar.in",
  "url": SITE_URL,
  "logo": `${SITE_URL}/icon-512x512.png`,
  "description": "Official digital platform of Alamnagar, Madhepura, Bihar, founded by Mukesh Kumar Malakar to preserve Mithila culture and foster local digital empowerment.",
  "foundingDate": "2024",
  "founder": { "@id": `${SITE_URL}#founder` },
  "areaServed": { 
    "@type": "Place",
    "name": "Alamnagar, Madhepura, Bihar, India",
    "geo": { "@type": "GeoCoordinates", "latitude": "25.9333", "longitude": "86.1167" }
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "digitechinfo.india@gmail.com",
    "contactType": "customer support",
    "areaServed": "IN",
    "availableLanguage": ["Hindi", "English", "Maithili"]
  }
};

// 🔥 3. LOCAL PLACE SCHEMA (🚀 VIRAL SECRET FOR LOCAL SEO #1 RANKING)
const placeSchema = {
  "@context": "https://schema.org",
  "@type": "Place",
  "@id": `${SITE_URL}#place`,
  "name": "Alamnagar",
  "description": "A historic and culturally rich village in Madhepura district, Bihar, known for its Mithila heritage and strong community.",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "25.9333",
    "longitude": "86.1167"
  },
  "containedInPlace": {
    "@type": "AdministrativeArea",
    "name": "Madhepura, Bihar, India"
  },
  "photo": `${SITE_URL}/og-cover.png`
};

// 🔥 4. FAQ SCHEMA (Triggers "People Also Ask" in Google)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "आलमनगर.इन (Alamnagar.in) क्या है?",
      "acceptedAnswer": { 
        "@type": "Answer", 
        "text": "Alamnagar.in आलमनगर, मधेपुरा, बिहार का आधिकारिक डिजिटल प्लेटफॉर्म है। इसे Createra.in के संस्थापक मुखेश कुमार मलाकार द्वारा गाँव की संस्कृति और समुदाय को डिजिटल रूप से जोड़ने के लिए बनाया गया है।" 
      }
    },
    {
      "@type": "Question",
      "name": "क्या आलमनगर प्लेटफॉर्म का उपयोग करना मुफ्त है?",
      "acceptedAnswer": { 
        "@type": "Answer", 
        "text": "जी हाँ, Alamnagar.in पर रजिस्टर करना, समुदाय से जुड़ना और मार्केटप्लेस का उपयोग करना 100% मुफ्त है।" 
      }
    },
    {
      "@type": "Question",
      "name": "आलमनगर की इतिहास और संस्कृति के बारे में जानकारी कहाँ मिलेगी?",
      "acceptedAnswer": { 
        "@type": "Answer", 
        "text": "हमारे 'About' और 'Heritage' सेक्शन में आलमनगर की समृद्ध मिथिला-अंगिका विरासत, चंदेल वंश की परंपराओं और स्थानीय इतिहास की विस्तृत जानकारी उपलब्ध है।" 
      }
    }
  ]
};

// 🔥 5. WEBSITE & BREADCRUMB SCHEMA
const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  "name": "Alamnagar",
  "url": SITE_URL,
  "description": HERO_TAGLINE,
  "publisher": { "@id": `${SITE_URL}#organization` },
  "inLanguage": "hi-IN",
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${SITE_URL}/community?search={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

// ==================== ROOT LAYOUT ====================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="hi" 
      dir="ltr"
      className={`${inter.variable} ${notoSansDevanagari.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="msvalidate.01" content="04BA0BC01BC4F0F4605763AC11C4F674" />

        {/* 🔥 Performance: DNS Prefetch & Preconnect for Critical Resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        
        <link rel="canonical" href={SITE_URL} />
        
        {/* 🔥 Viral Secret: Native App Feel on iOS */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Alamnagar" />
        
        {/* 🔥 Inject ALL JSON-LD schemas for Google Knowledge Graph Domination */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <body className={`antialiased bg-stone-50 text-stone-900 selection:bg-amber-200 selection:text-amber-900 font-sans`}>
        {/* ✅ PWA Service Worker Registration */}
        <PWAProvider />
        
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} 
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }} 
            title="Google Tag Manager"
          />
        </noscript>

        {children}
        
        {/* ✅ Google Tag Manager (Lazy Loaded) */}
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>

        {/* ✅ Google Analytics (Lazy Loaded) */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || []; 
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date()); 
            gtag('config', '${GA_MEASUREMENT_ID}', { 
              page_path: window.location.pathname, 
              app_name: 'Alamnagar', 
              app_url: '${SITE_URL}', 
              send_page_view: true, 
              page_title: document.title,
              anonymize_ip: true 
            });
          `}
        </Script>
        
        {/* ✅ Vercel Speed Insights (Core Web Vitals Tracking) */}
        <SpeedInsights />
      </body>
    </html>
  );
}