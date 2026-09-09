import { MetadataRoute } from 'next';

const BASE_URL = 'https://alamnagar.in';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // ✅ Main Sitemap: Static pages + Spotlights (Community content)
      url: `${BASE_URL}/sitemap.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      // ✅ Profiles Sitemap: Dynamic user profiles (Updated weekly)
      url: `${BASE_URL}/sitemap-profiles.xml`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}