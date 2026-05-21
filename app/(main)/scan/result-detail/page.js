'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLang } from '@/lib/LanguageContext';
import { Suspense, useState, useEffect } from 'react';


function ResultDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();

  // scan page එකෙන් data pass කරනවා
  const diseaseName = searchParams.get('disease') || '';
  const diseaseLabel = searchParams.get('label') || '';
  const confidence = searchParams.get('confidence') || '0';
  const crop = searchParams.get('crop') || '';
  const [image, setImage] = useState('');

useEffect(() => {
  const stored = localStorage.getItem('govi_nena_last_scan_image');
  if (stored) setImage(stored);
}, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${diseaseLabel} - Govi Nena`,
        text: `Detected ${diseaseLabel} with ${confidence}% confidence.`,
        url: window.location.href
      });
    }
  };

  const envFactors = [
    { icon: '🌡️', label: 'Temperature', value: '28-32°C', status: lang === 'si' ? 'අනුකූල' : 'Favorable', color: '#4CAF50' },
    { icon: '💧', label: 'Humidity', value: '75-85%', status: lang === 'si' ? 'ඉහළ අවදානම' : 'High Risk', color: '#E65100' },
    { icon: '💨', label: 'Wind', value: lang === 'si' ? 'මධ්‍යම' : 'Moderate', status: lang === 'si' ? 'සාමාන්‍ය' : 'Normal', color: '#1565C0' },
    { icon: '📅', label: lang === 'si' ? 'කාලය' : 'Season', value: 'Yala', status: 'Apr - Sep', color: '#795548' },
  ];

  const warningSigns = [
    lang === 'si' ? 'කොළ කහ හෝ දුඹුරු වීම' : 'Yellowing or browning of leaves',
    lang === 'si' ? 'කොළ මත කළු ලප හෝ තුවාල' : 'Dark spots or lesions on foliage',
    lang === 'si' ? 'වර්ධනය මන්දගාමී හෝ මැලවීම' : 'Stunted growth or wilting',
    lang === 'si' ? 'ධාන්‍ය හෝ පළතුරු වර්ණ වෙනස් වීම' : 'Fruit or grain discoloration',
  ];

  const preventionTips = [
    lang === 'si' ? 'ශාක අතර නිවැරදි දුර පවත්වන්න' : 'Maintain proper spacing between plants for air circulation',
    lang === 'si' ? 'රෝගී ශාක කොටස් නිතිපතා ඉවත් කරන්න' : 'Remove infected plant debris regularly',
    lang === 'si' ? 'අවදානම් කාලවලදී fungicide ඉසින්න' : 'Apply preventive fungicide during high-risk periods',
    lang === 'si' ? 'ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න' : 'Use disease-resistant crop varieties when available',
  ];

  const treatmentSteps = [
    lang === 'si' ? 'රෝගී කොළ සහ ශාක කොටස් ඉවත් කරලා දහනය කරන්න' : 'Remove and burn infected leaves and plant parts immediately',
    lang === 'si' ? 'නිර්දේශිත දිලීර නාශකය නිවැරදි ප්‍රමාණයෙන් ඉසින්න' : 'Apply recommended fungicide at correct dosage and intervals',
    lang === 'si' ? 'ජල කළමනාකරණය වැඩිදියුණු කරන්න' : 'Improve water management to reduce leaf wetness',
    lang === 'si' ? 'සතිය ගණනකට පසු නැවත ශාක නිරීක්ෂණය කරන්න' : 'Re-inspect plants after one week for improvement',
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FBF7', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Hero Image Section ── */}
      <div style={{ position: 'relative', height: 'clamp(220px, 35vw, 400px)', overflow: 'hidden' }}>
        {image ? (
          <img src={decodeURIComponent(image)} alt="captured"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }} />
        )}
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)' }} />

        {/* Top buttons */}
        <div style={{ position: 'absolute', top: 'clamp(32px, 5vw, 56px)', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 clamp(16px, 4vw, 48px)' }}>
          <button onClick={() => router.back()}
            style={{ width: 'clamp(44px, 5vw, 56px)', height: 'clamp(44px, 5vw, 56px)', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5L5 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button onClick={handleShare}
            style={{ width: 'clamp(44px, 5vw, 56px)', height: 'clamp(44px, 5vw, 56px)', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="6" cy="12" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="19" r="3" stroke="white" strokeWidth="2"/>
              <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="white" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        {/* Disease badge overlay */}
        <div style={{ position: 'absolute', bottom: 'clamp(16px, 3vw, 32px)', left: 'clamp(16px, 4vw, 48px)', right: 'clamp(16px, 4vw, 48px)' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRadius: 'clamp(16px, 2vw, 24px)', padding: 'clamp(16px, 2.5vw, 28px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#1B5E20', fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: '700', margin: '0 0 4px' }}>{diseaseLabel}</h2>
            <p style={{ color: '#795548', fontSize: 'clamp(14px, 1.5vw, 20px)', margin: '0 0 14px' }}>{diseaseName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: 'clamp(8px, 1vw, 12px)', background: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#4CAF50', borderRadius: '6px', width: `${confidence}%`, transition: 'width 0.6s ease' }} />
              </div>
              <span style={{ color: '#1B5E20', fontSize: 'clamp(16px, 1.8vw, 24px)', fontWeight: '700', flexShrink: 0 }}>{confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 5vw, 60px)', display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 3vw, 32px)' }}>

        {/* Environmental Factors */}
        <div style={{ background: '#fff', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <h3 style={{ color: '#1B5E20', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '600', margin: '0 0 20px' }}>
            {lang === 'si' ? 'වාතාවරණ සාධක / Environmental Factors' : 'Environmental Factors / වාතාවරණ සාධක'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
            {envFactors.map((f, i) => (
              <div key={i} style={{ background: '#F9FBF7', borderRadius: 'clamp(14px, 1.5vw, 20px)', padding: 'clamp(14px, 2vw, 24px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: 'clamp(20px, 2vw, 28px)' }}>{f.icon}</span>
                  <span style={{ color: '#795548', fontSize: 'clamp(11px, 1vw, 15px)' }}>{f.label}</span>
                </div>
                <p style={{ color: '#1B5E20', fontSize: 'clamp(16px, 1.8vw, 24px)', fontWeight: '700', margin: '0 0 4px' }}>{f.value}</p>
                <p style={{ color: f.color, fontSize: 'clamp(11px, 1vw, 14px)', margin: 0, fontWeight: '500' }}>{f.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About Disease */}
        <div style={{ background: '#fff', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: 'clamp(36px, 3.5vw, 48px)', height: 'clamp(36px, 3.5vw, 48px)', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={{ color: '#1B5E20', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '600', margin: 0 }}>
              {lang === 'si' ? 'රෝගය ගැන / About This Disease' : 'About This Disease / රෝගය ගැන'}
            </h3>
          </div>

          {/* Warning Signs */}
          <div style={{ background: 'rgba(253,216,53,0.12)', borderLeft: '4px solid #FDD835', borderRadius: '0 12px 12px 0', padding: 'clamp(16px, 2vw, 24px)', marginTop: '16px' }}>
            <h4 style={{ color: '#1B5E20', fontSize: 'clamp(14px, 1.3vw, 18px)', fontWeight: '600', margin: '0 0 12px' }}>⚠️ {lang === 'si' ? 'අනතුරු ලකුණු' : 'Warning Signs'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {warningSigns.map((sign, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#E65100', fontSize: '14px', marginTop: '2px', flexShrink: 0 }}>•</span>
                  <p style={{ color: '#555', fontSize: 'clamp(13px, 1.2vw, 18px)', lineHeight: 1.6, margin: 0 }}>{sign}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prevention Tips */}
        <div style={{ background: '#fff', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <h3 style={{ color: '#1B5E20', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '600', margin: '0 0 20px' }}>
            {lang === 'si' ? 'වැළැක්වීමේ ඉඟි / Prevention Tips' : 'Prevention Tips / වැළැක්වීමේ ඉඟි'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>
            {preventionTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px, 1.5vw, 20px)' }}>
                <div style={{ width: 'clamp(36px, 3.5vw, 48px)', height: 'clamp(36px, 3.5vw, 48px)', borderRadius: '50%', background: '#E8F5E9', color: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 1.5vw, 22px)', fontWeight: '700', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ color: '#555', fontSize: 'clamp(14px, 1.3vw, 20px)', lineHeight: 1.7, margin: 0, paddingTop: '6px' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Steps */}
        <div style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 8px 32px rgba(46,125,50,0.3)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <h3 style={{ color: '#fff', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '600', margin: '0 0 24px' }}>
            {lang === 'si' ? 'ප්‍රතිකාර පියවර / Treatment Steps' : 'Treatment Steps / ප්‍රතිකාර පියවර'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.5vw, 20px)' }}>
            {treatmentSteps.map((step, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 'clamp(14px, 1.5vw, 20px)', padding: 'clamp(16px, 2vw, 24px)', display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px, 1.5vw, 20px)' }}>
                <div style={{ width: 'clamp(36px, 3.5vw, 48px)', height: 'clamp(36px, 3.5vw, 48px)', borderRadius: '50%', background: '#FDD835', color: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 1.5vw, 22px)', fontWeight: '700', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ color: '#fff', fontSize: 'clamp(14px, 1.3vw, 20px)', lineHeight: 1.7, margin: 0, paddingTop: '6px' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <button onClick={() => router.back()}
          style={{ background: '#fff', border: '2px solid #2E7D32', borderRadius: 'clamp(16px, 2vw, 24px)', padding: 'clamp(16px, 1.5vw, 22px)', color: '#2E7D32', fontWeight: '600', fontSize: 'clamp(15px, 1.5vw, 20px)', cursor: 'pointer', width: '100%' }}>
          {lang === 'si' ? '← ආපසු' : '← Go Back'}
        </button>

      </div>
    </div>
  );
}

export default function ResultDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FBF7' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #4CAF50', borderTopColor: 'transparent' }} />
      </div>
    }>
      <ResultDetailContent />
    </Suspense>
  );
}