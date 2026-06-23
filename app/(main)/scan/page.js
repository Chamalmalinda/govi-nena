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

  const initialCrop = cropFromUrl && CROPS[cropFromUrl] ? cropFromUrl : 'tomato';
  const [step, setStep] = useState('camera');
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
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

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !model) return;

    setPredicting(true);
    stopCamera();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 224;
        canvas.height = 224;
        ctx.drawImage(img, 0, 0, 224, 224);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);

        const prediction = await predict(canvas, selectedCrop, CROPS[selectedCrop].classes);
        if (!prediction) { setPredicting(false); return; }
        const { disease: diseaseName, confidence, isUncertain } = prediction;

        if (diseaseName === 'unknown') {
          setResult({ 
            disease: 'unknown', 
            confidence, 
            isUncertain: true,
            siName: 'හඳුනාගත නොහැකි රෝගයක්',
            enName: 'Disease Not Identified'
          });
          setTreatment({
            name: t.results_unknown,
            symptoms: t.results_unknown_symptoms,
            chemical: t.results_unknown_consult,
            organic: t.results_unknown_consult,
            prevention: t.results_unknown_tip
          });
        } else {
          const treatmentData = await getTreatmentOffline(selectedCrop, diseaseName, lang);
          const siData = await getTreatmentOffline(selectedCrop, diseaseName, 'si');
          const enData = await getTreatmentOffline(selectedCrop, diseaseName, 'en');
          setResult({ 
            disease: diseaseName, 
            confidence, 
            isUncertain,
            siName: siData.name,
            enName: enData.name
          });
          setTreatment(treatmentData);
          localStorage.setItem('govi_nena_last_scan_image', dataUrl);
        }
        setPredicting(false);
        setStep('result');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
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
    const { disease: diseaseName, confidence, isUncertain } = prediction;

    if (diseaseName === 'unknown') {
      setResult({ 
        disease: 'unknown', 
        confidence, 
        isUncertain: true,
        siName: 'හඳුනාගත නොහැකි රෝගයක්',
        enName: 'Disease Not Identified'
      });
      setTreatment({
        name: t.results_unknown,
        symptoms: t.results_unknown_symptoms,
        chemical: t.results_unknown_consult,
        organic: t.results_unknown_consult,
        prevention: t.results_unknown_tip
      });
    } else {
      const treatmentData = await getTreatmentOffline(selectedCrop, diseaseName, lang);
      const siData = await getTreatmentOffline(selectedCrop, diseaseName, 'si');
      const enData = await getTreatmentOffline(selectedCrop, diseaseName, 'en');
      setResult({ 
        disease: diseaseName, 
        confidence, 
        isUncertain,
        siName: siData.name,
        enName: enData.name
      });
      setTreatment(treatmentData);
      localStorage.setItem('govi_nena_last_scan_image', canvas.toDataURL('image/jpeg'));
    }
    setPredicting(false);
    setStep('result');
  };

  const speakResult = () => {
    if (!treatment) return;
    const chemText = result?.isUncertain
      ? (lang === 'si' ? 'අවිනිශ්චිත ස්කෑන් පරීක්ෂණ සඳහා රසායනික ප්‍රතිකාර නිර්දේශ නොකෙරේ.' : 'Chemical recommendations are withheld for uncertain scans.')
      : treatment.chemical;
    const text = `${t.results_detected}: ${treatment.name}. ${t.results_symptoms}: ${treatment.symptoms}. ${t.results_chemical}: ${chemText}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'si' ? 'si-LK' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    setStep('camera');
    setResult(null);
    setTreatment(null);
    setCapturedImage(null);
    loadModel(selectedCrop).then(loaded => { if (loaded) startCamera(); });
  };

  const handleViewDetails = () => {
    if (!result || !treatment) return;
    if (capturedImage) localStorage.setItem('govi_nena_last_scan_image', capturedImage);
    const params = new URLSearchParams({
      disease: result.disease,
      label: treatment.name,
      confidence: String(result.confidence),
      crop: selectedCrop || '',
      isUncertain: String(!!result.isUncertain),
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
    if (!cropFromUrl || !CROPS[cropFromUrl]) {
      router.push('/home');
      return;
    }
    loadModel(cropFromUrl).then(loaded => { 
      if (loaded) {
        startCamera();
      }
    });
    return () => stopCamera();
  }, [cropFromUrl, router, loadModel]);

  // ── STEP 2: Camera ──
  if (step === 'camera') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(32px, 5vw, 64px) clamp(16px, 3vw, 40px) 16px' }}>
          <button onClick={() => { stopCamera(); router.push('/home'); }} style={{ color: '#fff', fontSize: 'clamp(18px, 2vw, 26px)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', paddingBottom: 'clamp(32px, 5vw, 64px)' }}>
              {/* Image Upload Button */}
              <label style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0
              }}
              title={t.scan_upload_img}
              >
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM14.14 11.86L11.39 15.4L9.43 13.04L6.5 17H17.5L14.14 11.86Z" fill="#ffffff"/>
                </svg>
              </label>

              {/* Shutter Button */}
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

              {/* Spacing element to keep the shutter button perfectly centered */}
              <div style={{ width: '56px', height: '56px', flexShrink: 0 }} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <button onClick={handleReset} style={{ width: 'clamp(40px, 4vw, 56px)', height: 'clamp(40px, 4vw, 56px)', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5L5 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ color: '#fff', fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: '700', margin: 0 }}>Analysis Results</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(12px, 1.2vw, 15px)', margin: '2px 0 0', fontWeight: '500' }}>විශ්ලේෂණ ප්‍රතිඵල</p>
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

        <div style={{ flex: 1, padding: 'clamp(20px, 3vw, 48px) clamp(16px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box', paddingBottom: '48px' }}>

          {result.isUncertain && (
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

          {capturedImage && (
            <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px' }}>
              <h3 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: '600', marginBottom: '14px', marginTop: 0 }}>
                Captured Image / ග්‍රහණය කළ රූපය
              </h3>
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: 'clamp(140px, 20vw, 200px)' }}>
                <img src={capturedImage} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: 'clamp(11px, 1vw, 14px)', fontWeight: '500' }}>
                  {result.confidence}% match
                </div>
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
            <h2 style={{ color: '#1B5E20', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '700', margin: '0 0 4px 0', fontFamily: 'system-ui, sans-serif' }}>
              {result.siName}
            </h2>
            <p style={{ color: '#795548', fontSize: 'clamp(16px, 1.8vw, 20px)', fontWeight: '600', margin: '0 0 20px 0' }}>
              {result.enName}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'clamp(12px, 1vw, 14px)' }}>
              <span style={{ color: '#888', fontWeight: '500' }}>Confidence / විශ්වාසය</span>
              <span style={{ color: '#333', fontWeight: '700' }}>{result.confidence}%</span>
            </div>
            <div style={{ height: '10px', background: '#e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '8px', transition: 'width 0.6s ease', background: '#4CAF50', width: `${result.confidence}%` }} />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
            <h3 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: '600', margin: '0 0 12px 0' }}>
              විස්තරය / Description
            </h3>
            <p style={{ color: '#555', fontSize: 'clamp(14px, 1.2vw, 17px)', lineHeight: 1.6, margin: 0 }}>
              {treatment.symptoms}
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '24px' }}>
            <h3 style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.5vw, 18px)', fontWeight: '600', margin: '0 0 20px 0' }}>
              ප්‍රතිකාර පියවර / Treatment Steps
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: lang === 'si' ? 'රසායනික ප්‍රතිකාර / Chemical Treatment' : 'Chemical Treatment / රසායනික ප්‍රතිකාර', text: result.isUncertain ? (lang === 'si' ? 'අවිනිශ්චිත ස්කෑන් පරීක්ෂණ සඳහා රසායනික ප්‍රතිකාර නිර්දේශ නොකෙරේ. කරුණාකර නැවත ස්කෑන් කරන්න.' : 'Chemical recommendations are withheld for uncertain scans. Please scan again.') : treatment.chemical, color: '#1565C0' },
                { label: lang === 'si' ? 'කාබනික ප්‍රතිකාර / Organic Treatment' : 'Organic Treatment / කාබනික ප්‍රතිකාර', text: treatment.organic, color: '#2E7D32' },
                { label: lang === 'si' ? 'වැළැක්වීම / Prevention' : 'Prevention / වැළැක්වීම', text: treatment.prevention, color: '#E65100' }
              ].map((s, index) => (
                <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: index < 2 ? '16px' : '0', borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none' }}>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '8px' }}>
                    <circle cx="12" cy="12" r="10" stroke="#e0e0e0" strokeWidth="1.5"/>
                    <path d="M8 12L11 15L16 9" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleViewDetails} style={{
            background: '#fff',
            border: '2.5px solid #4CAF50',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            width: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            fontFamily: 'inherit'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2"/>
                  <path d="M12 8V12M12 16H12.01" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p style={{ color: '#1B5E20', fontSize: 'clamp(15px, 1.4vw, 18px)', fontWeight: '700', margin: 0 }}>
                  View Full Details
                </p>
                <p style={{ color: '#888', fontSize: 'clamp(11px, 1vw, 13px)', margin: '2px 0 0', fontWeight: '500' }}>
                  සම්පූර්ණ තොරතුරු බලන්න
                </p>
              </div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M9 5L16 12L9 19" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button onClick={() => router.push('/heatmap')} style={{
            background: 'linear-gradient(to right, #1B5E20, #4CAF50)',
            borderRadius: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 4px 16px rgba(46,125,50,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            fontFamily: 'inherit'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="9" r="3" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <p style={{ color: '#fff', fontSize: 'clamp(15px, 1.4vw, 18px)', fontWeight: '700', margin: 0 }}>
                  Check Outbreak Map
                </p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(11px, 1vw, 13px)', margin: '2px 0 0', fontWeight: '500' }}>
                  ව්‍යාප්ති සිතියම බලන්න
                </p>
              </div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button onClick={handleReset} style={{
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