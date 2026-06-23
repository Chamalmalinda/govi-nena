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
    <div style={{ minHeight: '100vh', background: '#F9FBF7', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Sticky Green Header */}
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
          <button onClick={() => router.back()} style={{ width: 'clamp(40px, 4vw, 56px)', height: 'clamp(40px, 4vw, 56px)', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5L5 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: '700', margin: 0 }}>Disease Details</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(12px, 1.2vw, 15px)', margin: '2px 0 0', fontWeight: '500' }}>රෝග විස්තර</p>
          </div>
          <LangToggle lang={lang} toggleLang={toggleLang} />
          <button onClick={handleShare} style={{ width: 'clamp(44px, 4.5vw, 60px)', height: 'clamp(44px, 4.5vw, 60px)', borderRadius: '50%', background: '#FDD835', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="#1B5E20" strokeWidth="2.5" />
              <circle cx="6" cy="12" r="3" stroke="#1B5E20" strokeWidth="2.5" />
              <circle cx="18" cy="19" r="3" stroke="#1B5E20" strokeWidth="2.5" />
              <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="#1B5E20" strokeWidth="2.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        padding: 'clamp(20px, 3vw, 48px) clamp(16px, 4vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        paddingBottom: '48px'
      }}>

        {/* Uncertain Warning Banner */}
        {isUncertain && (
          <div style={{
            background: '#FFFDE7',
            border: '1.5px solid #FBC02D',
            borderRadius: '20px',
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

        {/* Captured Image Card */}
        {image && (
          <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px' }}>
            <h3 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: '600', marginBottom: '14px', marginTop: 0 }}>
              Captured Image / ග්‍රහණය කළ රූපය
            </h3>
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              maxHeight: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f4f6f0',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
            }}>
              <img src={image} alt="captured" style={{
                maxWidth: '100%',
                maxHeight: '320px',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block'
              }} />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: 'clamp(11px, 1vw, 14px)', fontWeight: '500' }}>
                {confidence}% match
              </div>
            </div>
          </div>
        )}

        {/* Disease Details Header Card */}
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
          <h2 style={{ color: '#1B5E20', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'system-ui, sans-serif' }}>
            {treatment.name}
          </h2>
          <p style={{ color: '#795548', fontSize: 'clamp(16px, 1.8vw, 20px)', fontWeight: '600', margin: '0 0 20px 0' }}>
            {diseaseName}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'clamp(12px, 1vw, 14px)' }}>
            <span style={{ color: '#888', fontWeight: '500' }}>Confidence / විශ්වාසය</span>
            <span style={{ color: '#333', fontWeight: '700' }}>{confidence}%</span>
          </div>
          <div style={{ height: '10px', background: '#e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '8px', transition: 'width 0.6s ease', background: '#4CAF50', width: `${confidence}%` }} />
          </div>
        </div>

        {/* Symptoms / Description Card */}
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
          <h3 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: '600', margin: '0 0 12px 0' }}>
            {t.detail_symptoms}
          </h3>
          <p style={{ color: '#555', fontSize: 'clamp(14px, 1.2vw, 17px)', lineHeight: 1.6, margin: 0 }}>
            {treatment.symptoms}
          </p>
        </div>

        {/* Environmental Factors Card */}
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
          <h3 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: '600', margin: '0 0 16px 0' }}>
            {t.detail_env}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
            {envFactors.map((f, i) => (
              <div key={i} style={{ background: '#F9FBF7', borderRadius: '16px', padding: '16px', border: '1px solid #f0f4ef' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{f.icon}</span>
                  <span style={{ color: '#795548', fontSize: '12px', fontWeight: '500' }}>{f.label}</span>
                </div>
                <p style={{ color: '#1B5E20', fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>{f.value}</p>
                <p style={{ color: f.color, fontSize: '12px', margin: 0, fontWeight: '600' }}>{f.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Signs Banner Card */}
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
          <div style={{ background: '#FFFDE7', border: '1.5px solid #FBC02D', borderRadius: '16px', padding: '16px' }}>
            <h4 style={{ color: '#F57F17', margin: '0 0 10px 0', fontSize: 'clamp(14px, 1.2vw, 17px)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> {t.detail_warning}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {warningSigns.map((sign, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#F57F17', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>•</span>
                  <p style={{ color: '#5D4037', fontSize: 'clamp(12px, 1vw, 15px)', lineHeight: '1.4', margin: 0 }}>{sign}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prevention Tips Card */}
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
          <h3 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: '600', margin: '0 0 16px 0' }}>
            {t.detail_prevention}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {preventionTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E8F5E9', color: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>
                  {i + 1}
                </div>
                <p style={{ color: '#555', fontSize: 'clamp(13px, 1.2vw, 16px)', lineHeight: 1.5, margin: 0, paddingTop: '4px' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Steps Card */}
        <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
          <h3 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: '600', margin: '0 0 16px 0' }}>
            {t.detail_treatment}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: lang === 'si' ? 'නිරීක්ෂණය / Observation' : 'Observation / නිරීක්ෂණය', text: treatmentSteps[0], color: '#795548' },
              { label: lang === 'si' ? 'රසායනික ප්‍රතිකාර / Chemical Treatment' : 'Chemical Treatment / රසායනික ප්‍රතිකාර', text: treatmentSteps[1], color: '#1565C0' },
              { label: lang === 'si' ? 'කාබනික ප්‍රතිකාර / Organic Treatment' : 'Organic Treatment / කාබනික ප්‍රතිකාර', text: treatmentSteps[2], color: '#2E7D32' },
              { label: lang === 'si' ? 'පසු විපරම / Follow-up' : 'Follow-up / පසු විපරම', text: treatmentSteps[3], color: '#E65100' }
            ].map((s, index) => (
              <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: index < 3 ? '16px' : '0', borderBottom: index < 3 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4CAF50', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', flexShrink: 0, marginTop: '2px' }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: s.color, fontSize: 'clamp(12px, 1vw, 15px)', fontWeight: '600', margin: '0 0 4px 0' }}>
                      {s.label}
                    </p>
                    <p style={{ color: '#555', fontSize: 'clamp(13px, 1.2vw, 16px)', lineHeight: 1.5, margin: 0 }}>
                      {s.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <button onClick={() => router.back()} style={{
          background: 'transparent',
          border: '2px solid #2E7D32',
          borderRadius: '20px',
          padding: '16px',
          color: '#2E7D32',
          fontWeight: '600',
          fontSize: 'clamp(15px, 1.5vw, 18px)',
          cursor: 'pointer',
          width: '100%',
          fontFamily: 'inherit',
          transition: 'background 0.2s'
        }}>
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