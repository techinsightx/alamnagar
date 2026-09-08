// src/app/spotlights/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

// ✅ Edge runtime rakha hai, lekin ab isme koi heavy Firebase import nahi hai
export const runtime = 'edge';

export const alt = 'Alamnagar Spotlight';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0c0a09 0%, #14532d 100%)', // Premium Emerald Gradient
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Glow Effect */}
        <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
          
          {/* Logo / Brand Icon */}
          <div style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, #10b981, #f59e0b)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', fontWeight: '900', marginBottom: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            आ
          </div>
          
          {/* Title */}
          <h1 style={{ fontSize: '72px', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-2px' }}>
            Alamnagar
          </h1>
          
          {/* Subtitle */}
          <div style={{ fontSize: '28px', color: '#f59e0b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '40px' }}>
            Spotlight Community
          </div>

          {/* Bottom Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '22px', color: '#a8a29e', fontWeight: '500' }}>
            <span>📍 Madhepura, Bihar</span>
            <span>•</span>
            <span>🌐 alamnagar.in</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}