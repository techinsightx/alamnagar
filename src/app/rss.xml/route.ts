import { NextResponse } from 'next/server';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const revalidate = 3600; // 1 hour cache

export async function GET() {
  try {
    const SITE_URL = 'https://alamnagar.in';
    const FOUNDER_NAME = 'Alamnagar Admin';

    // ✅ Fetch latest spotlights instead of videos
    const q = query(
      collection(db, 'spotlights'),
      orderBy('createdAt', 'desc'),
      limit(20) // Top 20 latest posts for RSS
    );
    
    const snapshot = await getDocs(q);
    let itemsXml = '';

    snapshot.forEach((doc) => {
      const data = doc.data();
      const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      const pubDate = dateObj.toUTCString();
      
      // ✅ Updated URL structure for spotlights
      const postUrl = `${SITE_URL}/spotlights/${doc.id}`;
      
      // ✅ Use mediaUrl for thumbnail (works for both images and videos)
      const thumbnail = data.mediaUrl || `${SITE_URL}/og-cover.png`;
      const description = data.content || 'Check out this amazing post from Alamnagar!';
      const title = data.title || 'New Post from Alamnagar';
      const author = data.userName || 'Alamnagar Citizen';
      
      // Extract first hashtag as category, or default to 'Community'
      const category = (data.hashtags && data.hashtags.length > 0) 
        ? data.hashtags[0].replace('#', '') 
        : 'Community';

      itemsXml += `
        <item>
          <title><![CDATA[${title}]]></title>
          <link>${postUrl}</link>
          <guid isPermaLink="true">${postUrl}</guid>
          <pubDate>${pubDate}</pubDate>
          <description><![CDATA[${description}]]></description>
          <content:encoded><![CDATA[
            <p>${description}</p>
            <br/>
            ${data.mediaUrl ? `<img src="${data.mediaUrl}" alt="Post Media" style="max-width: 100%; height: auto;" />` : ''}
            <br/>
            <p><strong>Read more on Alamnagar:</strong> <a href="${postUrl}">${postUrl}</a></p>
          ]]></content:encoded>
          <author><![CDATA[${author}]]></author>
          <category><![CDATA[${category}]]></category>
          <media:content url="${data.mediaUrl || ''}" type="${data.mediaType === 'video' ? 'video/mp4' : 'image/jpeg'}" />
          <media:thumbnail url="${thumbnail}" width="1200" height="630" />
        </item>
      `;
    });

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Alamnagar | हमारा गाँव, हमारी पहचान</title>
    <link>${SITE_URL}</link>
    <description>Discover the latest spotlights, community posts, gallery updates, and village stories from Alamnagar, Madhepura, Bihar. Stay connected with our roots.</description>
    <language>hi-in</language>
    <copyright>© ${new Date().getFullYear()} Alamnagar.in. All rights reserved.</copyright>
    <managingEditor>admin@alamnagar.in (${FOUNDER_NAME})</managingEditor>
    <webMaster>admin@alamnagar.in (${FOUNDER_NAME})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Next.js 14 RSS Generator</generator>
    
    <image>
      <url>${SITE_URL}/android-chrome-512x512.png</url>
      <title>Alamnagar</title>
      <link>${SITE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>

    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('❌ RSS Generation Error:', error);
    return new NextResponse('Error generating RSS feed', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}