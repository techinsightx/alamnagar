// app/spotlights/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Apne firebase config ka path check karna

export const runtime = 'edge'; // Zaroori hai fast generation ke liye

export const alt = 'Alamnagar Spotlight';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Font loading for premium look
const fontBold = fetch(new URL('@/assets/fonts/Inter-Bold.ttf', import.meta.url)).then((res) => res.arrayBuffer());
// Note: Agar font load na ho toh default system font use hoga, jo ki fine hai.

export default async function Image({ params }: { params: { id: string } }) {
  let title = 'Alamnagar Spotlight';
  let author = 'Alamnagar Community';
  let category = 'Community';
  let hasImage = false;

  try {
    // Fetch post data from Firestore
    const docRef = doc(db, 'spotlights', params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      title = data.title || 'Untitled Post';
      author = data.userName || 'Anonymous';
      category = data.category || 'Spotlight';
      hasImage = !!(data.imageUrl || data.videoThumbnail);
    }
  } catch (error) {
    console.error('Error fetching post for OG image:', error);
  }

  // Truncate long titles
  const displayTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0c0a09 0%, #14532d 100%)', // Emerald to Stone gradient
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Decor */}
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        
        {/* Top Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', zIndex: 10 }}>
          <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #10b981, #f59e0b)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 'bold' }}>
            आ
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-1px' }}>Alamnagar.in</div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10, maxWidth: '1000px' }}>
          <div style={{ fontSize: '24px', color: '#f59e0b', fontWeight: '600', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {category} • Spotlight
          </div>
          
          <h1 style={{ fontSize: '72px', fontWeight: '900', lineHeight: '1.1', marginBottom: '40px', letterSpacing: '-2px' }}>
            {displayTitle}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '28px', color: '#a8a29e' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              {author.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: '600', color: 'white' }}>{author}</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ position: 'absolute', bottom: '40px', fontSize: '20px', color: '#78716c', display: 'flex', gap: '20px' }}>
          <span>📍 Madhepura, Bihar</span>
          <span>•</span>
          <span>🌐 alamnagar.in</span>
        </div>
      </div>
    ),
    { ...size }
  );
}