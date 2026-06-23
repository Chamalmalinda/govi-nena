'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLang } from '@/lib/LanguageContext';
import { getTreatmentOffline } from '@/lib/offlineStorage';
import { Suspense, useState, useEffect } from 'react';

function LangToggle({ lang, toggleLang }) {
  return (
    <button onClick={toggleLang} style={{
      width: '72px', height: '32px', borderRadius: '16px',
      background: lang === 'si' ? '#4CAF50' : '#888',
      position: 'relative', border: 'none', cursor: 'pointer',
      transition: 'background 0.3s', flexShrink: 0,
    }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '3px',
        left: lang === 'si' ? '3px' : '43px',
        transition: 'left 0.3s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
      }} />
      <span style={{
        position: 'absolute', fontSize: '10px', fontWeight: '700', color: '#fff',
        left: lang === 'si' ? '33px' : '8px',
        top: '7px', transition: 'left 0.3s', userSelect: 'none'
      }}>
        {lang === 'si' ? 'සිං' : 'EN'}
      </span>
    </button>
  );
}

function ResultDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, toggleLang, t } = useLang();

  const diseaseName = searchParams.get('disease') || '';
  const confidence = searchParams.get('confidence') || '0';
  const crop = searchParams.get('crop') || '';
  const isUncertain = searchParams.get('isUncertain') === 'true';

  const [image, setImage] = useState('');
  const [treatment, setTreatment] = useState(null);

  // Image localStorage හරහා ගන්නවා
  useEffect(() => {
    const stored = localStorage.getItem('govi_nena_last_scan_image');
    if (stored) setImage(stored);
  }, []);

  // lang change වුනාම treatment re-fetch කරනවා
  useEffect(() => {
    if (!crop || !diseaseName) return;
    getTreatmentOffline(crop, diseaseName, lang).then(data => setTreatment(data));
  }, [crop, diseaseName, lang]);

  const handleShare = () => {
    if (navigator.share && treatment) {
      navigator.share({
        title: `${treatment.name} - Govi Nena`,
        text: `Detected ${treatment.name} with ${confidence}% confidence.`,
        url: window.location.href
      });
    }
  };

  const envFactors = [
    { icon: '🌡️', label: 'Temperature', value: '28-32°C', status: t.detail_favorable, color: '#4CAF50' },
    { icon: '💧', label: 'Humidity', value: '75-85%', status: t.detail_high_risk, color: '#E65100' },
    { icon: '💨', label: 'Wind', value: t.detail_moderate, status: t.detail_normal, color: '#1565C0' },
    { icon: '📅', label: t.detail_season, value: 'Yala', status: 'Apr - Sep', color: '#795548' },
  ];

  const warningSigns = [t.detail_warning1, t.detail_warning2, t.detail_warning3, t.detail_warning4];

  const preventionTips = treatment ? [
    treatment.prevention,
    t.detail_prev1,
    t.detail_prev2,
    t.detail_prev3,
  ] : [];

  const treatmentSteps = treatment ? [
    t.detail_step1,
    isUncertain ? (lang === 'si' ? 'අවිනිශ්චිත ස්කෑන් පරීක්ෂණ සඳහා රසායනික ප්‍රතිකාර නිර්දේශ නොකෙරේ. කරුණාකර නැවත ස්කෑන් කරන්න.' : 'Chemical recommendations are withheld for uncertain scans. Please scan again.') : treatment.chemical,
    treatment.organic,
    t.detail_step4,
  ] : [];

  if (!treatment) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FBF7' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #4CAF50', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FBF7', fontFamily: 'system-ui, sans-serif' }}>

      {/* Hero Image */}
      <div style={{ position: 'relative', height: 'clamp(220px, 35vw, 400px)', overflow: 'hidden' }}>
        {image
          ? <img src={image} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)' }} />

        {/* Top buttons */}
        <div style={{ position: 'absolute', top: 'clamp(32px, 5vw, 56px)', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 clamp(16px, 4vw, 48px)' }}>
          <button onClick={() => router.back()} style={{ width: 'clamp(44px, 5vw, 56px)', height: 'clamp(44px, 5vw, 56px)', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5L5 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>

          <LangToggle lang={lang} toggleLang={toggleLang} />

          <button onClick={handleShare} style={{ width: 'clamp(44px, 5vw, 56px)', height: 'clamp(44px, 5vw, 56px)', borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="6" cy="12" r="3" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="19" r="3" stroke="white" strokeWidth="2"/>
              <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="white" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        {/* Disease badge */}
        <div style={{ position: 'absolute', bottom: 'clamp(16px, 3vw, 32px)', left: 'clamp(16px, 4vw, 48px)', right: 'clamp(16px, 4vw, 48px)' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRadius: 'clamp(16px, 2vw, 24px)', padding: 'clamp(16px, 2.5vw, 28px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#1B5E20', fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: '700', margin: '0 0 4px' }}>{treatment.name}</h2>
            <p style={{ color: '#795548', fontSize: 'clamp(13px, 1.5vw, 20px)', margin: '0 0 14px' }}>{diseaseName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: 'clamp(8px, 1vw, 12px)', background: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: parseFloat(confidence) >= 80 ? '#4CAF50' : parseFloat(confidence) >= 60 ? '#FDD835' : '#FF9800', borderRadius: '6px', width: `${confidence}%`, transition: 'width 0.6s ease' }} />
              </div>
              <span style={{ color: '#1B5E20', fontSize: 'clamp(16px, 1.8vw, 24px)', fontWeight: '700', flexShrink: 0 }}>{confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px, 4vw, 48px) clamp(16px, 5vw, 60px)', display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 3vw, 32px)' }}>

        {isUncertain && (
          <div style={{
            background: '#FFFDE7',
            border: '1.5px solid #FBC02D',
            borderRadius: 'clamp(20px, 2.5vw, 32px)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', background: '#FFF9C4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
            </div>
            <div>
              <h4 style={{ color: '#F57F17', margin: '0 0 4px 0', fontSize: 'clamp(14px, 1.2vw, 18px)', fontWeight: '700' }}>
                {lang === 'si' ? 'අවිනිශ්චිත ස්කෑන් පරීක්ෂණයකි' : 'Uncertain Scan Result'}
              </h4>
              <p style={{ color: '#5D4037', margin: 0, fontSize: 'clamp(12px, 1vw, 15px)', lineHeight: '1.4' }}>
                {lang === 'si' 
                  ? `මෙම රෝග විනිශ්චය 30% - 59% අතර අවිනිශ්චිත මට්ටමක පවතී. නිවැරදි රසායනික ප්‍රතිකාර භාවිතයට පෙර, වඩාත් හොඳ ආලෝකයකින් පත්‍රය ලඟට කර නැවත ස්කෑන් කිරීමට කාරුණික වන්න.` 
                  : `This match is uncertain (30% - 59% confidence). Before applying chemical treatments, please scan again closer to the leaf under better lighting.`
                }
              </p>
            </div>
          </div>
        )}

        {/* Symptoms */}
        <div style={{ background: '#fff', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#C62828', flexShrink: 0 }} />
            <h3 style={{ color: '#C62828', fontSize: 'clamp(17px, 2vw, 26px)', fontWeight: '600', margin: 0 }}>{t.detail_symptoms}</h3>
          </div>
          <p style={{ color: '#555', fontSize: 'clamp(14px, 1.3vw, 20px)', lineHeight: 1.7, margin: 0 }}>{treatment.symptoms}</p>
        </div>

        {/* Environmental Factors */}
        <div style={{ background: '#fff', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <h3 style={{ color: '#1B5E20', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '600', margin: '0 0 20px' }}>{t.detail_env}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'clamp(12px, 2vw, 20px)' }}>
            {envFactors.map((f, i) => (
              <div key={i} style={{ background: '#F9FBF7', borderRadius: 'clamp(14px, 1.5vw, 20px)', padding: 'clamp(14px, 2vw, 24px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: 'clamp(18px, 2vw, 26px)' }}>{f.icon}</span>
                  <span style={{ color: '#795548', fontSize: 'clamp(11px, 1vw, 14px)' }}>{f.label}</span>
                </div>
                <p style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.8vw, 22px)', fontWeight: '700', margin: '0 0 4px' }}>{f.value}</p>
                <p style={{ color: f.color, fontSize: 'clamp(11px, 1vw, 14px)', margin: 0, fontWeight: '500' }}>{f.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Signs */}
        <div style={{ background: '#fff', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <div style={{ background: 'rgba(253,216,53,0.12)', borderLeft: '4px solid #FDD835', borderRadius: '0 12px 12px 0', padding: 'clamp(16px, 2vw, 24px)' }}>
            <h4 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 20px)', fontWeight: '600', margin: '0 0 12px' }}>
              ⚠️ {t.detail_warning}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {warningSigns.map((sign, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#E65100', fontSize: '16px', flexShrink: 0 }}>•</span>
                  <p style={{ color: '#555', fontSize: 'clamp(13px, 1.2vw, 18px)', lineHeight: 1.6, margin: 0 }}>{sign}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prevention Tips */}
        <div style={{ background: '#fff', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <h3 style={{ color: '#1B5E20', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '600', margin: '0 0 20px' }}>{t.detail_prevention}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>
            {preventionTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px, 1.5vw, 20px)' }}>
                <div style={{ width: 'clamp(36px, 3.5vw, 48px)', height: 'clamp(36px, 3.5vw, 48px)', borderRadius: '50%', background: '#E8F5E9', color: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(15px, 1.5vw, 20px)', fontWeight: '700', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ color: '#555', fontSize: 'clamp(14px, 1.3vw, 20px)', lineHeight: 1.7, margin: 0, paddingTop: '6px' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Steps */}
        <div style={{ background: 'linear-gradient(135deg, #1B5E20, #4CAF50)', borderRadius: 'clamp(20px, 2.5vw, 32px)', boxShadow: '0 8px 32px rgba(46,125,50,0.3)', padding: 'clamp(20px, 3vw, 40px)' }}>
          <h3 style={{ color: '#fff', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '600', margin: '0 0 24px' }}>{t.detail_treatment}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.5vw, 20px)' }}>
            {treatmentSteps.map((step, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 'clamp(14px, 1.5vw, 20px)', padding: 'clamp(16px, 2vw, 24px)', display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px, 1.5vw, 20px)' }}>
                <div style={{ width: 'clamp(36px, 3.5vw, 48px)', height: 'clamp(36px, 3.5vw, 48px)', borderRadius: '50%', background: '#FDD835', color: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(15px, 1.5vw, 20px)', fontWeight: '700', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ color: '#fff', fontSize: 'clamp(14px, 1.3vw, 20px)', lineHeight: 1.7, margin: 0, paddingTop: '6px' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back button */}
        <button onClick={() => router.back()} style={{ background: '#fff', border: '2px solid #2E7D32', borderRadius: 'clamp(16px, 2vw, 24px)', padding: 'clamp(16px, 1.5vw, 22px)', color: '#2E7D32', fontWeight: '600', fontSize: 'clamp(15px, 1.5vw, 20px)', cursor: 'pointer', width: '100%' }}>
          {t.detail_back}
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