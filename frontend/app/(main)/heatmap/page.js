'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';

export default function HeatmapPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCrop, setFilterCrop] = useState('all');

  useEffect(() => {
    // Auth validation check
    const token = localStorage.getItem('govi_nena_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchOutbreaks = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/outbreaks');
        if (res.ok) {
          const data = await res.json();
          setOutbreaks(data);
        }
      } catch (err) {
        console.error('Failed to fetch outbreaks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutbreaks();
  }, [router]);

  const filteredOutbreaks = filterCrop === 'all' 
    ? outbreaks 
    : outbreaks.filter(o => o.crop.toLowerCase() === filterCrop);

  // Group outbreaks by disease to show stats
  const stats = outbreaks.reduce((acc, curr) => {
    acc[curr.disease] = (acc[curr.disease] || 0) + 1;
    return acc;
  }, {});

  const getCropEmoji = (crop) => {
    switch (crop?.toLowerCase()) {
      case 'paddy': return '🌾';
      case 'tomato': return '🍅';
      case 'chili': return '🌶️';
      default: return '🍃';
    }
  };

  const getDiseaseName = (disease) => {
    // Format db strings cleanly
    return disease.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FBF7', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{
        background: '#1B5E20',
        padding: 'clamp(36px, 5vw, 64px) clamp(20px, 4vw, 60px) clamp(20px, 3vw, 40px)',
        borderRadius: '0 0 24px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <button onClick={() => router.back()} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5L5 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: '700', margin: 0 }}>Outbreak Heatmap</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(12px, 1.2vw, 15px)', margin: '2px 0 0', fontWeight: '500' }}>ව්‍යාප්ති සිතියම</p>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div style={{
        flex: 1,
        padding: '24px clamp(16px, 4vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        paddingBottom: '48px'
      }}>

        {/* Dynamic Interactive Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: lang === 'si' ? 'සියල්ල' : 'All Crops' },
            { id: 'paddy', label: lang === 'si' ? 'වී' : 'Paddy' },
            { id: 'tomato', label: lang === 'si' ? 'තක්කාලි' : 'Tomato' },
            { id: 'chili', label: lang === 'si' ? 'මිරිස්' : 'Chili' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterCrop(btn.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                background: filterCrop === btn.id ? '#1B5E20' : '#fff',
                color: filterCrop === btn.id ? '#fff' : '#1B5E20',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'background 0.2s, color 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {btn.id !== 'all' && getCropEmoji(btn.id)} {btn.label}
            </button>
          ))}
        </div>

        {/* Map Vector Visualization Card */}
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '24px', border: '1px solid #f0f0f0' }}>
          <h3 style={{ color: '#1B5E20', fontSize: '18px', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            {lang === 'si' ? 'සිතියම් දර්ශකය' : 'Outbreak Hotspots Map'}
          </h3>

          <div style={{ 
            height: '240px', 
            background: '#E8F5E9', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px solid rgba(76,175,80,0.2)'
          }}>
            {/* Visual Vector Silhouette representing Sri Lanka */}
            <svg width="180" height="240" viewBox="0 0 100 150" fill="none" style={{ opacity: 0.85 }}>
              <path d="M50 10 C60 20 70 30 75 45 C80 60 78 80 72 95 C68 105 60 120 50 135 C42 120 34 105 28 95 C22 80 20 60 25 45 C30 30 40 20 50 10 Z" fill="#A5D6A7" stroke="#81C784" strokeWidth="1.5"/>
            </svg>

            {/* Outbreak Plots mapping log coordinates dynamically on the visual grid */}
            {filteredOutbreaks.map((outbreak, idx) => {
              // Convert coordinates to mock visualization offsets safely
              const [lng, lat] = outbreak.location.coordinates;
              const xPercent = Math.max(10, Math.min(90, ((lng - 79.5) / 2.5) * 100));
              const yPercent = Math.max(10, Math.min(90, (1 - (lat - 5.9) / 4.0) * 100));

              return (
                <div 
                  key={outbreak._id || idx}
                  style={{
                    position: 'absolute',
                    left: `${xPercent}%`,
                    top: `${yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer'
                  }}
                  title={`${getDiseaseName(outbreak.disease)} (${outbreak.confidence}%)`}
                >
                  <span style={{ fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                    {getCropEmoji(outbreak.crop)}
                  </span>
                  <div style={{
                    position: 'absolute',
                    width: '12px',
                    height: '12px',
                    background: 'red',
                    borderRadius: '50%',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: -1,
                    opacity: 0.6,
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }}/>
                </div>
              );
            })}

            {filteredOutbreaks.length === 0 && (
              <div style={{ position: 'absolute', color: '#558B2F', fontWeight: '600', fontSize: '14px' }}>
                {lang === 'si' ? 'රෝග ව්‍යාප්තීන් වාර්තා වී නැත' : 'No recorded outbreaks found'}
              </div>
            )}
          </div>
          
          <style jsx global>{`
            @keyframes ping {
              75%, 100% {
                transform: translate(-50%, -50%) scale(2.5);
                opacity: 0;
              }
            }
          `}</style>
        </div>

        {/* Outbreak List Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ color: '#1B5E20', fontSize: '18px', fontWeight: '700', margin: '4px 0' }}>
            {lang === 'si' ? 'මෑතකාලීන වාර්තා' : 'Recent Outbreak Logs'}
          </h3>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #4CAF50', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filteredOutbreaks.length > 0 ? (
            filteredOutbreaks.map((o) => (
              <div
                key={o._id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  padding: '16px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#F1F8E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0
                }}>
                  {getCropEmoji(o.crop)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 2px', color: '#1B5E20', fontSize: '15px', fontWeight: '700' }}>
                    {getDiseaseName(o.disease)}
                  </h4>
                  <p style={{ margin: 0, color: '#795548', fontSize: '12px', fontWeight: '500' }}>
                    📍 {lang === 'si' ? 'ඛණ්ඩාංක' : 'Coordinates'}: {o.location.coordinates[1].toFixed(4)}, {o.location.coordinates[0].toFixed(4)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: '#E8F5E9',
                    color: '#2E7D32',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {o.confidence}% Match
                  </span>
                  <p style={{ margin: '6px 0 0', color: '#aaa', fontSize: '10px', fontWeight: '500' }}>
                    {new Date(o.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              color: '#888',
              border: '1px solid #f0f0f0'
            }}>
              {lang === 'si' ? 'වාර්තාගත දත්ත කිසිවක් නැත' : 'No records match selected filter.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
