import { MetadataRoute } from 'next';
import { getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BASE_URL = 'https://alamnagar.in';

export const revalidate = 3600; // 1 hour cache
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // ✅ Fetch Spotlights (Main dynamic content of Alamnagar)
    // Limit set to 10000 to prevent Vercel Serverless Function memory/timeout issues
    const spotlightsQuery = query(
      collection(db, 'spotlights'),
      orderBy('createdAt', 'desc'),
      limit(10000) 
    );

    const snapshot = await getDocs(spotlightsQuery);

    const spotlightsSitemap: MetadataRoute.Sitemap = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate() || new Date();
      const mediaUrl = data.mediaUrl;

      return {
        url: `${BASE_URL}/spotlights/${doc.id}`, // Matches your Next.js route
        lastModified: createdAt,
        changeFrequency: 'weekly', // Spotlight posts don't change hourly
        priority: 0.8,
        // ✅ Add thumbnail/image to sitemap for better Google Image SEO
        images: mediaUrl ? [mediaUrl] : [],
      };
    });

    console.log(`[Sitemap-Spotlights] Successfully generated ${spotlightsSitemap.length} URLs for alamnagar.in`);
    return spotlightsSitemap;

  } catch (error) {
    console.error('[Sitemap-Spotlights] Fetch failed:', error);
    
    // 🛡️ Fallback: Return empty array or static pages only to prevent build crash
    return [
      {
        url: `${BASE_URL}/spotlights`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      }
    ];
  }
}