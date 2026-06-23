'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';

const DISTRICT_CENTROIDS = {
  Colombo: [79.8612, 6.9271],
  Gampaha: [79.9925, 7.0840],
  Kalutara: [79.9733, 6.5854],
  Kandy: [80.6350, 7.2906],
  Matale: [80.6234, 7.4675],
  'Nuwara Eliya': [80.7891, 6.9497],
  Galle: [80.2170, 6.0535],
  Matara: [80.5000, 5.9500],
  Hambantota: [81.1185, 6.1246],
  Jaffna: [80.0074, 9.6615],
  Mannar: [79.9142, 8.9811],
  Vavuniya: [80.4982, 8.7542],
  Anuradhapura: [80.3947, 8.3122],
  Polonnaruwa: [81.0006, 7.9397],
  Kurunegala: [80.3647, 7.4864],
  Puttalam: [79.8275, 8.0330],
  Badulla: [81.0556, 6.9934],
  Monaragala: [81.3500, 6.8700],
  Ratnapura: [80.4037, 6.6828],
  Kegalle: [80.3424, 7.2513],
  Trincomalee: [81.2335, 8.5873],
  Batticaloa: [81.6924, 7.7102],
  Ampara: [81.6747, 7.2912]
};

export default function AlertsPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    // Auth validation check
    const token = localStorage.getItem('govi_nena_token');
    const storedUser = localStorage.getItem('govi_nena_user');
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    let userObj = null;
    try {
      userObj = JSON.parse(storedUser);
    } catch (e) {
      console.error(e);
    }

    const fetchAlerts = async (lat, lng) => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/alerts?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    // Attempt GPS Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          fetchAlerts(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // GPS blocked: Fallback to registered district centroid coordinates
          const district = userObj?.district || 'Matale';
          const coords = DISTRICT_CENTROIDS[district] || [80.6234, 7.4675]; // default Matale
          setUserCoords({ lat: coords[1], lng: coords[0] });
          fetchAlerts(coords[1], coords[0]);
        }
      );
    } else {
      const district = userObj?.district || 'Matale';
      const coords = DISTRICT_CENTROIDS[district] || [80.6234, 7.4675];
      setUserCoords({ lat: coords[1], lng: coords[0] });
      fetchAlerts(coords[1], coords[0]);
    }
  }, [router]);

  const getCropEmoji = (crop) => {
    switch (crop?.toLowerCase()) {
      case 'paddy': return '🌾';
      case 'tomato': return '🍅';
      case 'chili': return '🌶️';
      default: return '🍃';
    }
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
            <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: '700', margin: 0 }}>Spread Warnings</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(12px, 1.2vw, 15px)', margin: '2px 0 0', fontWeight: '500' }}>ව්‍යාප්ති ඇඟවීම්</p>
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

        {/* Location Indicator Card */}
        {userCoords && (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '12px 18px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>📍</span>
            <span style={{ fontSize: '13px', color: '#558B2F', fontWeight: '600' }}>
              {lang === 'si' 
                ? `පරීක්ෂා කරන්නේ: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)} අවට සීමාවයි`
                : `Scanning within 10km of: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`}
            </span>
          </div>
        )}

        {/* Warnings Alerts Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #4CAF50', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert._id}
                style={{
                  background: '#FFFDE7', // Warning yellow shade
                  borderRadius: '20px',
                  boxShadow: '0 4px 16px rgba(251,192,45,0.15)',
                  padding: '20px',
                  border: '1.5px solid #FBC02D',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Accent line on warning border */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '6px',
                  background: '#FBC02D'
                }} />

                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#FFF9C4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  {getCropEmoji(alert.crop)}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#F57F17', margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700' }}>
                    {alert.title}
                  </h4>
                  <p style={{ color: '#5D4037', margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
                    {alert.message}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: 'rgba(251,192,45,0.3)',
                      color: '#E65100',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      ⚠️ {lang === 'si' ? `${alert.radiusKm}km කලාපය` : `Radius: ${alert.radiusKm}km`}
                    </span>
                    <span style={{ color: '#888', fontSize: '11px', fontWeight: '500' }}>
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
              <h4 style={{ color: '#1B5E20', fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }}>
                {lang === 'si' ? 'අවදානමක් හඳුනාගෙන නැත' : 'No Outbreaks Nearby'}
              </h4>
              <p style={{ color: '#795548', fontSize: '14px', margin: 0, lineHeight: 1.4 }}>
                {lang === 'si' 
                  ? 'ඔබේ ප්‍රදේශය අවට බෝග ව්‍යාප්ති අනතුරු ඇඟවීම් කිසිවක් හමුවී නොමැත. ඔබේ වගාවන් ආරක්ෂිතයි.' 
                  : 'We have not detected any high spread of disease near you. Your crops are currently safe.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
