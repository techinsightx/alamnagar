import { MetadataRoute } from 'next';
import { getDocs, collection, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BASE_URL = 'https://alamnagar.in';
const MAX_URLS_PER_SITEMAP = 45000;

// ✅ Sirf 'revalidate' valid hai sitemap mein. 'dynamic' line hata di gayi hai.
export const revalidate = 3600; // 1 hour cache

// ============================================
// STATIC PAGES (Alamnagar Specific)
// ============================================
const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/community`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/marketplace`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/gallery`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/privacy`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/terms`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
];

// ============================================
// HELPERS
// ============================================
const toSafeDate = (timestamp: Timestamp | Date | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
};

const calculatePriority = (views: number, likes: number): number => {
  if (views > 10000) return 0.9;
  if (views > 5000) return 0.85;
  if (views > 1000) return 0.8;
  if (views > 500) return 0.75;
  if (likes > 50) return 0.7;
  return 0.6;
};

const calculateFrequency = (createdAt: Date): MetadataRoute.Sitemap[0]['changeFrequency'] => {
  const daysOld = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  if (daysOld < 1) return 'hourly';
  if (daysOld < 7) return 'daily';
  if (daysOld < 30) return 'weekly';
  if (daysOld < 180) return 'monthly';
  return 'yearly';
};

// ============================================
// FETCHERS (Dynamic Content)
// ============================================
async function fetchSpotlights(): Promise<MetadataRoute.Sitemap> {
  try {
    const spotlightsQuery = query(
      collection(db, 'spotlights'),
      orderBy('createdAt', 'desc'),
      limit(5000)
    );

    const snapshot = await getDocs(spotlightsQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = toSafeDate(data.createdAt);
      const views = data.views ?? 0;
      const likes = data.likes ?? 0;

      return {
        url: `${BASE_URL}/spotlights/${doc.id}`,
        lastModified: createdAt,
        changeFrequency: calculateFrequency(createdAt),
        priority: calculatePriority(views, likes),
        images: data.mediaUrl ? [data.mediaUrl] : [],
      };
    });
  } catch (error) {
    console.error('[Sitemap] Spotlights fetch failed:', error);
    return [];
  }
}

async function fetchProfiles(): Promise<MetadataRoute.Sitemap> {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(1000)
    );

    const snapshot = await getDocs(usersQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const username = data.username || data.handle || doc.id;
      
      return {
        url: `${BASE_URL}/profile/${username}`,
        lastModified: toSafeDate(data.lastActive) || toSafeDate(data.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
        images: data.photoURL ? [data.photoURL] : [],
      };
    });
  } catch (error) {
    console.warn('[Sitemap] Profiles fetch failed:', error);
    return [];
  }
}

// ============================================
// MAIN SITEMAP EXPORT
// ============================================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [spotlights, profiles] = await Promise.all([
    fetchSpotlights(),
    fetchProfiles(),
  ]);

  const sitemap: MetadataRoute.Sitemap = [
    ...STATIC_PAGES,
    ...spotlights,
    ...profiles,
  ];

  if (sitemap.length > MAX_URLS_PER_SITEMAP) {
    console.warn(`[Sitemap] Truncated from ${sitemap.length} to ${MAX_URLS_PER_SITEMAP}`);
    return sitemap.slice(0, MAX_URLS_PER_SITEMAP);
  }

  console.log(`[Sitemap] Successfully generated ${sitemap.length} URLs for alamnagar.in`);
  return sitemap;
}