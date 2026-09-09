import { MetadataRoute } from 'next';
import { getDocs, collection, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BASE_URL = 'https://alamnagar.in';
const MAX_PROFILES = 10000; // Optimized limit for community platforms

export const revalidate = 3600; // 1 hour cache
export const dynamic = 'force-static';

// ============================================
// HELPERS
// ============================================
const toSafeDate = (timestamp: Timestamp | Date | undefined): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
};

const calculateProfilePriority = (followers: number, isVerified: boolean): number => {
  if (isVerified) return 0.95; // Verified users get top priority
  if (followers > 10000) return 0.9;
  if (followers > 5000) return 0.85;
  if (followers > 1000) return 0.8;
  if (followers > 100) return 0.7;
  return 0.6;
};

// ============================================
// MAIN FUNCTION
// ============================================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // ✅ Fetch active/public profiles ordered by followers for better SEO prioritization
    const usersQuery = query(
      collection(db, 'users'),
      where('isPublic', '==', true), // Ensure you have this field, or remove if not used
      orderBy('followers', 'desc'),
      limit(MAX_PROFILES)
    );

    const snapshot = await getDocs(usersQuery);

    const profiles: MetadataRoute.Sitemap = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Use username if available, otherwise fallback to doc.id
      const username = data.username || data.handle || doc.id;
      const followers = data.followers || data.followersCount || 0;
      const isVerified = data.isVerified || false;

      return {
        url: `${BASE_URL}/profile/${username}`,
        lastModified: toSafeDate(data.lastActive) || toSafeDate(data.updatedAt) || toSafeDate(data.createdAt),
        changeFrequency: 'weekly' as const,
        priority: calculateProfilePriority(followers, isVerified),
        images: data.photoURL ? [data.photoURL] : [],
      };
    });

    console.log(`[Sitemap-Profiles] Successfully generated ${profiles.length} profile URLs for alamnagar.in`);
    return profiles;
  } catch (error) {
    console.warn('[Sitemap-Profiles] Ordered fetch failed (likely missing composite index). Trying fallback...', error);

    // 🛡️ Fallback: Simple fetch without orderBy (prevents build crashes if index is missing)
    try {
      const fallbackQuery = query(
        collection(db, 'users'),
        // Removed orderBy to avoid index requirement, just limit to recent/active
        limit(MAX_PROFILES)
      );

      const fallbackSnapshot = await getDocs(fallbackQuery);

      return fallbackSnapshot.docs.map((doc) => {
        const data = doc.data();
        const username = data.username || data.handle || doc.id;
        
        return {
          url: `${BASE_URL}/profile/${username}`,
          lastModified: toSafeDate(data.createdAt),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
          images: data.photoURL ? [data.photoURL] : [],
        };
      });
    } catch (fallbackError) {
      console.error('[Sitemap-Profiles] Fallback also failed:', fallbackError);
      return []; // Return empty array instead of crashing the build
    }
  }
}