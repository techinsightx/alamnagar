import { NextRequest, NextResponse } from 'next/server';

// ✅ Unique Key for Alamnagar.in (Isko .env mein rakhna best practice hai, lekin abhi ke liye yahan safe hai)
const INDEXNOW_KEY = 'alamnagar-in-2026-secure-indexnow-key';
const HOST = 'alamnagar.in';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Validate ki URL hamare domain se hi hai (Security best practice)
  if (!url.startsWith(`https://${HOST}`) && !url.startsWith(`http://localhost`)) {
    return NextResponse.json({ error: 'Invalid domain URL' }, { status: 403 });
  }

  try {
    // ✅ Official IndexNow API (Bing, Yandex, Seznam sabko ek saath notify karta hai)
    const response = await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`,
      { method: 'POST' } // IndexNow recommends POST for better payload handling
    );

    if (response.ok) {
      console.log(`[IndexNow] ✅ Successfully submitted: ${url}`);
      return NextResponse.json({ 
        status: 'success', 
        message: 'URL submitted to IndexNow',
        url: url 
      }, { status: 200 });
    } else {
      console.error(`[IndexNow] ❌ Failed to submit ${url}:`, response.statusText);
      return NextResponse.json({ 
        status: 'error', 
        message: 'IndexNow submission failed',
        details: response.statusText 
      }, { status: response.status });
    }
  } catch (error) {
    console.error('[IndexNow] Network error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Internal server error during IndexNow submission' 
    }, { status: 500 });
  }
}

// ✅ Optional: POST method for batch submissions (up to 10,000 URLs at once)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urlList } = body;

    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return NextResponse.json({ error: 'urlList array is required' }, { status: 400 });
    }

    // Validate all URLs
    const validUrls = urlList.filter((url: string) => 
      url.startsWith(`https://${HOST}`) || url.startsWith(`http://localhost`)
    );

    if (validUrls.length === 0) {
      return NextResponse.json({ error: 'No valid domain URLs provided' }, { status: 403 });
    }

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, // Optional: Agar tum root mein key file host karte ho
        urlList: validUrls,
      }),
    });

    if (response.ok) {
      console.log(`[IndexNow] ✅ Successfully submitted batch of ${validUrls.length} URLs`);
      return NextResponse.json({ 
        status: 'success', 
        message: `Batch submitted to IndexNow`,
        count: validUrls.length 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Batch submission failed',
        details: response.statusText 
      }, { status: response.status });
    }
  } catch (error) {
    console.error('[IndexNow] Batch network error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Internal server error during batch submission' 
    }, { status: 500 });
  }
}