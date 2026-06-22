'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useModel } from '@/hooks/useModel';
import { getTreatmentOffline } from '@/lib/offlineStorage';
import { useLang } from '@/lib/LanguageContext';

const CROPS = {
  paddy: { si: 'වී', en: 'Paddy', emoji: '🌾', classes: ['bacterial_leaf_blight','bacterial_leaf_streak','bacterial_panicle_blight','blast','brown_spot','dead_heart','downy_mildew','hispa','normal','tungro'] },
  tomato: { si: 'තක්කාලි', en: 'Tomato', emoji: '🍅', classes: ['Tomato___Bacterial_spot','Tomato___Early_blight','Tomato___Late_blight','Tomato___Leaf_Mold','Tomato___Septoria_leaf_spot','Tomato___Spider_mites Two-spotted_spider_mite','Tomato___Target_Spot','Tomato___Tomato_Yellow_Leaf_Curl_Virus','Tomato___Tomato_mosaic_virus','Tomato___healthy'] },
  chili: { si: 'මිරිස්', en: 'Chili', emoji: '🌶️', classes: ['Bacterial Spot','Cercospora Leaf Spot','Curl Virus','Healthy Leaf','Nutrition Deficiency','White spot'] }
};

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

function ScanContent() {
  const { lang, toggleLang, t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cropFromUrl = searchParams.get('crop');
  const { model, loading: modelLoading, error: modelError, loadModel, predict, clearModel } = useModel();

  const [step, setStep] = useState(cropFromUrl ? 'camera' : 'crop');
  const [selectedCrop, setSelectedCrop] = useState(cropFromUrl || null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch { console.error('Camera access denied'); }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(tr => tr.stop());
  };

  const handleCropSelect = async (crop) => {
    setSelectedCrop(crop);
    setStep('camera');
    const loaded = await loadModel(crop);
    if (loaded) startCamera();
  };

  const captureAndPredict = async () => {
    if (!model || !videoRef.current) return;
    setPredicting(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 224;
    canvas.height = 224;
    ctx.drawImage(videoRef.current, 0, 0, 224, 224);
    setCapturedImage(canvas.toDataURL('image/jpeg'));
    stopCamera();

    const prediction = await predict(canvas, selectedCrop, CROPS[selectedCrop].classes);
    if (!prediction) { setPredicting(false); return; }
    const { disease: diseaseName, confidence } = prediction;

    if (confidence < 60) {
      setResult({ disease: 'unknown', confidence });
      setTreatment({
        name: t.results_unknown,
        symptoms: t.results_unknown_symptoms,
        chemical: t.results_unknown_consult,
        organic: t.results_unknown_consult,
        prevention: t.results_unknown_tip
      });
    } else {
      const treatmentData = await getTreatmentOffline(selectedCrop, diseaseName, lang);
      setResult({ disease: diseaseName, confidence });
      setTreatment(treatmentData);
      localStorage.setItem('govi_nena_last_scan_image', canvas.toDataURL('image/jpeg'));
    }
    setPredicting(false);
    setStep('result');
  };

  const speakResult = () => {
    if (!treatment) return;
    const text = `${t.results_detected}: ${treatment.name}. ${t.results_symptoms}: ${treatment.symptoms}. ${t.results_chemical}: ${treatment.chemical}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'si' ? 'si-LK' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    setStep('crop');
    setSelectedCrop(null);
    clearModel();
    setResult(null);
    setTreatment(null);
    setCapturedImage(null);
  };

  const handleViewDetails = () => {
    if (!result || !treatment) return;
    if (capturedImage) localStorage.setItem('govi_nena_last_scan_image', capturedImage);
    const params = new URLSearchParams({
      disease: result.disease,
      label: treatment.name,
      confidence: String(result.confidence),
      crop: selectedCrop || '',
    });
    router.push(`/scan/result-detail?${params.toString()}`);
  };

  // ── Language change වුනාම treatment re-fetch ──────────
  useEffect(() => {
    if (!result || !selectedCrop) return;

    if (result.disease === 'unknown') {
      setTreatment({
        name: t.results_unknown,
        symptoms: t.results_unknown_symptoms,
        chemical: t.results_unknown_consult,
        organic: t.results_unknown_consult,
        prevention: t.results_unknown_tip
      });
    } else {
      getTreatmentOffline(selectedCrop, result.disease, lang).then(setTreatment);
    }
  }, [lang]);

  useEffect(() => {
    if (cropFromUrl) {
      loadModel(cropFromUrl).then(loaded => { if (loaded) startCamera(); });
    }
    return () => stopCamera();
  }, []);

  // ── STEP 1: Crop Selection ──
  if (step === 'crop') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FBF7' }}>
        <div style={{ background: 'linear-gradient(to bottom, #1B5E20, #4CAF50)', padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 80px) clamp(24px, 4vw, 48px)', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <LangToggle lang={lang} toggleLang={toggleLang} />
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: '700', margin: '0 0 8px' }}>{t.scan_select_crop}</h1>
          <p style={{ opacity: 0.8, fontSize: 'clamp(14px, 1.5vw, 20px)', margin: 0 }}>{t.scan_select_sub}</p>
        </div>

        <div style={{ flex: 1, padding: 'clamp(20px, 4vw, 60px) clamp(16px, 5vw, 80px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(12px, 2vw, 24px)', alignContent: 'start' }}>
          {Object.entries(CROPS).map(([key, crop]) => (
            <button key={key} onClick={() => handleCropSelect(key)} style={{
              background: '#fff', border: '1px solid #e0e0e0',
              borderRadius: 'clamp(16px, 2vw, 28px)',
              padding: 'clamp(18px, 2.5vw, 32px)',
              display: 'flex', alignItems: 'center',
              gap: 'clamp(14px, 2vw, 28px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              cursor: 'pointer', textAlign: 'left', width: '100%'
            }}>
              <div style={{ fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1 }}>{crop.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: '700', color: '#1B5E20' }}>
                  {lang === 'si' ? crop.si : crop.en}
                </div>
                <div style={{ fontSize: 'clamp(12px, 1.2vw, 16px)', color: '#757575', marginTop: '4px' }}>
                  {lang === 'si' ? `රෝග ${crop.classes.length}ක්` : `${crop.classes.length} ${t.scan_diseases}`}
                </div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 5L16 12L9 19" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── STEP 2: Camera ──
  if (step === 'camera') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(32px, 5vw, 60px) clamp(16px, 3vw, 40px) 16px' }}>
          <button onClick={handleReset} style={{ color: '#fff', fontSize: 'clamp(18px, 2vw, 26px)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(46,125,50,0.85)', borderRadius: '20px', padding: '8px 20px', color: '#fff', fontSize: 'clamp(13px, 1.2vw, 18px)', fontWeight: '600' }}>
              {selectedCrop && `${CROPS[selectedCrop].emoji} ${lang === 'si' ? CROPS[selectedCrop].si : CROPS[selectedCrop].en}`}
            </div>
            <div style={{ background: 'rgba(253,216,53,0.2)', borderRadius: '12px', padding: '4px 14px' }}>
              <p style={{ color: '#FDD835', fontSize: 'clamp(11px, 1vw, 14px)', margin: 0 }}>
                ⚠️ {lang === 'si' ? `${CROPS[selectedCrop]?.si} ${t.scan_only_scan}` : `${t.scan_only_scan} ${CROPS[selectedCrop]?.en}`}
              </p>
            </div>
          </div>
          <LangToggle lang={lang} toggleLang={toggleLang} />
        </div>

        {modelLoading && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            <p style={{ color: '#fff', fontSize: 'clamp(16px, 1.5vw, 24px)', margin: 0 }}>{t.scan_loading}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(12px, 1vw, 16px)', margin: 0 }}>{t.scan_loading_sub}</p>
          </div>
        )}

        {modelError && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '24px' }}>
            <p style={{ color: '#EF5350', fontSize: 'clamp(16px, 1.5vw, 22px)', textAlign: 'center' }}>{modelError}</p>
            <button onClick={handleReset} style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '14px', padding: 'clamp(10px, 1.5vw, 16px) clamp(24px, 3vw, 40px)', fontSize: 'clamp(14px, 1.2vw, 18px)', cursor: 'pointer' }}>
              {t.scan_try_again}
            </button>
          </div>
        )}

        {!modelLoading && !modelError && (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '20px' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(13px, 1.2vw, 18px)', textAlign: 'center', margin: 0 }}>{t.scan_place_leaf}</p>
              <div style={{ position: 'relative', width: 'min(60vw, 60vh, 500px)', height: 'min(60vw, 60vh, 500px)' }}>
                <video ref={videoRef} autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover', display: 'block' }} />
                {[
                  { top: 0, left: 0, borderTop: '4px solid #4CAF50', borderLeft: '4px solid #4CAF50', borderRadius: '6px 0 0 0' },
                  { top: 0, right: 0, borderTop: '4px solid #4CAF50', borderRight: '4px solid #4CAF50', borderRadius: '0 6px 0 0' },
                  { bottom: 0, left: 0, borderBottom: '4px solid #4CAF50', borderLeft: '4px solid #4CAF50', borderRadius: '0 0 0 6px' },
                  { bottom: 0, right: 0, borderBottom: '4px solid #4CAF50', borderRight: '4px solid #4CAF50', borderRadius: '0 0 6px 0' },
                ].map((corner, i) => (
                  <div key={i} style={{ position: 'absolute', width: 'clamp(24px, 4%, 40px)', height: 'clamp(24px, 4%, 40px)', ...corner }} />
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(11px, 1vw, 15px)', textAlign: 'center', margin: 0 }}>{t.scan_good_light}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 'clamp(32px, 5vw, 64px)' }}>
              <button onClick={captureAndPredict} disabled={predicting} style={{
                width: 'clamp(72px, 8vw, 100px)', height: 'clamp(72px, 8vw, 100px)',
                borderRadius: '50%', background: predicting ? '#81C784' : '#fff',
                border: '5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: predicting ? 'not-allowed' : 'pointer', boxSizing: 'border-box'
              }}>
                {predicting
                  ? <div style={{ width: '40%', height: '40%', borderRadius: '50%', border: '4px solid #4CAF50', borderTopColor: 'transparent' }} />
                  : <div style={{ width: '78%', height: '78%', borderRadius: '50%', background: '#4CAF50' }} />
                }
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── STEP 3: Results ──
  if (step === 'result' && treatment) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FBF7' }}>
        <div style={{ background: '#1B5E20', padding: 'clamp(36px, 5vw, 64px) clamp(20px, 4vw, 60px) clamp(20px, 3vw, 40px)', borderRadius: '0 0 24px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '1200px', margin: '0 auto' }}>
            <button onClick={handleReset} style={{ width: 'clamp(40px, 4vw, 56px)', height: 'clamp(40px, 4vw, 56px)', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5L5 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '600', margin: 0 }}>{t.results_title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(12px, 1vw, 16px)', margin: '2px 0 0' }}>{t.results_sub}</p>
            </div>
            <LangToggle lang={lang} toggleLang={toggleLang} />
            <button onClick={speakResult} style={{ width: 'clamp(44px, 4.5vw, 60px)', height: 'clamp(44px, 4.5vw, 60px)', borderRadius: '50%', background: '#FDD835', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#1B5E20"/>
                <path d="M19.07 4.93C20.96 6.82 22 9.35 22 12C22 14.65 20.96 17.18 19.07 19.07" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15.54 8.46C16.48 9.4 17 10.67 17 12C17 13.33 16.48 14.6 15.54 15.54" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 'clamp(20px, 3vw, 48px) clamp(16px, 5vw, 80px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(16px, 2vw, 28px)', alignContent: 'start', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box', paddingBottom: '48px' }}>

          {capturedImage && (
            <div style={{ background: '#fff', borderRadius: 'clamp(16px, 2vw, 28px)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 'clamp(16px, 2vw, 28px)' }}>
              <h3 style={{ color: '#1B5E20', fontSize: 'clamp(16px, 1.5vw, 22px)', fontWeight: '600', marginBottom: '14px' }}>{t.results_captured}</h3>
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                <img src={capturedImage} alt="captured" style={{ width: '100%', height: 'clamp(180px, 25vw, 320px)', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: 'clamp(12px, 1vw, 16px)' }}>
                  {result.confidence}% match
                </div>
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 'clamp(16px, 2vw, 28px)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 'clamp(20px, 2.5vw, 36px)' }}>
            <h2 style={{ color: '#1B5E20', fontSize: 'clamp(22px, 3vw, 40px)', fontWeight: '700', marginBottom: '8px' }}>{treatment.name}</h2>
            <p style={{ color: '#795548', fontSize: 'clamp(15px, 1.5vw, 22px)', marginBottom: '20px' }}>{result.disease}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#1B5E20', fontSize: 'clamp(13px, 1.2vw, 18px)' }}>{t.results_confidence}</span>
              <span style={{ color: '#1B5E20', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: '700' }}>{result.confidence}%</span>
            </div>
            <div style={{ height: 'clamp(8px, 1vw, 14px)', background: '#e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '8px', transition: 'width 0.6s ease', background: result.confidence >= 80 ? '#4CAF50' : result.confidence >= 60 ? '#FDD835' : '#FF9800', width: `${result.confidence}%` }} />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 'clamp(16px, 2vw, 28px)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 'clamp(20px, 2.5vw, 36px)' }}>
            <h3 style={{ color: '#1B5E20', fontSize: 'clamp(17px, 1.8vw, 26px)', fontWeight: '600', marginBottom: '14px' }}>
              {t.results_symptoms} / {t.results_symptoms_sub}
            </h3>
            <p style={{ color: '#555', fontSize: 'clamp(14px, 1.3vw, 20px)', lineHeight: 1.7, margin: 0 }}>{treatment.symptoms}</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 'clamp(16px, 2vw, 28px)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: 'clamp(20px, 2.5vw, 36px)' }}>
            <h3 style={{ color: '#1B5E20', fontSize: 'clamp(17px, 1.8vw, 26px)', fontWeight: '600', marginBottom: '20px' }}>
              {t.results_treatment_steps} / {t.results_treatment_sub}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { num: 1, label: t.results_chemical, text: treatment.chemical, color: '#1565C0' },
                { num: 2, label: t.results_organic, text: treatment.organic, color: '#2E7D32' },
                { num: 3, label: t.results_prevention, text: treatment.prevention, color: '#E65100' },
              ].map((s) => (
                <div key={s.num} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: 'clamp(36px, 3.5vw, 52px)', height: 'clamp(36px, 3.5vw, 52px)', borderRadius: '50%', background: '#4CAF50', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 1.5vw, 22px)', fontWeight: '700', flexShrink: 0 }}>
                    {s.num}
                  </div>
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <p style={{ color: s.color, fontSize: 'clamp(12px, 1vw, 16px)', fontWeight: '600', margin: '0 0 4px' }}>{s.label}</p>
                    <p style={{ color: '#555', fontSize: 'clamp(14px, 1.2vw, 18px)', lineHeight: 1.6, margin: 0 }}>{s.text}</p>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '8px' }}>
                    <circle cx="12" cy="12" r="10" stroke="#e0e0e0" strokeWidth="1.5"/>
                    <path d="M8 12L11 15L16 9" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleViewDetails} style={{ background: '#fff', border: '2px solid #4CAF50', borderRadius: 'clamp(16px, 2vw, 28px)', padding: 'clamp(18px, 2vw, 28px) clamp(20px, 2.5vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', cursor: 'pointer', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 'clamp(44px, 4vw, 60px)', height: 'clamp(44px, 4vw, 60px)', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2"/>
                  <path d="M12 8V12M12 16H12.01" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: '#1B5E20', fontSize: 'clamp(16px, 1.5vw, 22px)', fontWeight: '600', margin: 0 }}>{t.results_view_details}</p>
                <p style={{ color: '#795548', fontSize: 'clamp(12px, 1vw, 16px)', margin: '2px 0 0' }}>{t.results_view_details_sub}</p>
              </div>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 5L16 12L9 19" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>

          <button onClick={() => router.push('/heatmap')} style={{ background: 'linear-gradient(to right, #1B5E20, #4CAF50)', borderRadius: 'clamp(16px, 2vw, 28px)', padding: 'clamp(18px, 2vw, 28px) clamp(20px, 2.5vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', width: '100%', boxShadow: '0 4px 20px rgba(46,125,50,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 'clamp(44px, 4vw, 60px)', height: 'clamp(44px, 4vw, 60px)', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="9" r="3" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: '#fff', fontSize: 'clamp(16px, 1.5vw, 22px)', fontWeight: '600', margin: 0 }}>{t.results_heatmap}</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(12px, 1vw, 16px)', margin: '2px 0 0' }}>{t.results_heatmap_sub}</p>
              </div>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>

          <button onClick={handleReset} style={{ background: 'transparent', border: '2px solid #2E7D32', borderRadius: 'clamp(16px, 2vw, 28px)', padding: 'clamp(16px, 1.5vw, 24px)', color: '#2E7D32', fontWeight: '600', fontSize: 'clamp(16px, 1.5vw, 22px)', cursor: 'pointer', width: '100%' }}>
            {t.results_scan_again}
          </button>

        </div>
      </div>
    );
  }

  return null;
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FBF7' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #4CAF50', borderTopColor: 'transparent' }} />
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}