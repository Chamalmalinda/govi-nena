'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import * as tf from '@tensorflow/tfjs';
import { getTreatmentOffline } from '@/lib/offlineStorage';
import { useLang } from '@/lib/LanguageContext';

const CROPS = {
  paddy: {
    si: 'වී', en: 'Paddy', emoji: '🌾',
    classes: ['bacterial_leaf_blight','bacterial_leaf_streak','bacterial_panicle_blight','blast','brown_spot','dead_heart','downy_mildew','hispa','normal','tungro']
  },
  tomato: {
    si: 'තක්කාලි', en: 'Tomato', emoji: '🍅',
    classes: ['Tomato___Bacterial_spot','Tomato___Early_blight','Tomato___Late_blight','Tomato___Leaf_Mold','Tomato___Septoria_leaf_spot','Tomato___Spider_mites Two-spotted_spider_mite','Tomato___Target_Spot','Tomato___Tomato_Yellow_Leaf_Curl_Virus','Tomato___Tomato_mosaic_virus','Tomato___healthy']
  },
  chili: {
    si: 'මිරිස්', en: 'Chili', emoji: '🌶️',
    classes: ['Bacterial Spot','Cercospora Leaf Spot','Curl Virus','Healthy Leaf','Nutrition Deficiency','White spot']
  }
};

export default function ScanPage() {
  const { t, lang } = useLang();
  const searchParams = useSearchParams();
  const cropFromUrl = searchParams.get('crop');

  const [step, setStep] = useState('crop'); // crop → camera → result
  const [selectedCrop, setSelectedCrop] = useState(cropFromUrl || null);
  const [model, setModel] = useState(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Model load කරන්න
  const loadModel = async (crop) => {
    setModelLoading(true);
    setModelError(null);
    try {
      const loadedModel = await tf.loadGraphModel(`/models/${crop}/model.json`);
      setModel(loadedModel);
      setModelLoading(false);
      return loadedModel;
    } catch (err) {
      setModelError(lang === 'si' ? 'Model load වුනේ නෑ' : 'Failed to load model');
      setModelLoading(false);
      return null;
    }
  };

  // Crop select කළාම
  const handleCropSelect = async (crop) => {
    setSelectedCrop(crop);
    setStep('camera');
    const loadedModel = await loadModel(crop);
    if (loadedModel) startCamera();
  };

  // Camera start
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 224, height: 224 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setModelError(lang === 'si' ? 'Camera access නෑ' : 'Camera access denied');
    }
  };

  // Camera stop
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  // Image capture + predict
  const captureAndPredict = async () => {
    if (!model || !videoRef.current) return;
    setPredicting(true);

    // Canvas එකට frame capture
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 224;
    canvas.height = 224;
    ctx.drawImage(videoRef.current, 0, 0, 224, 224);

    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
    stopCamera();

    // Tensor හදන්න
    const tensor = tf.browser.fromPixels(canvas)
      .resizeBilinear([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims(0);

    // Predict
    const predictions = await model.predict(tensor);
    const probabilities = await predictions.data();
    tensor.dispose();
    predictions.dispose();

    // Best prediction
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const confidence = (probabilities[maxIndex] * 100).toFixed(1);
    const diseaseName = CROPS[selectedCrop].classes[maxIndex];

    // Treatment ගන්න
    const treatmentData = await getTreatmentOffline(selectedCrop, diseaseName, lang);

    if (parseFloat(confidence) < 60) {
  setResult({ disease: 'unknown', confidence });
  setTreatment({
    name: lang === 'si' ? 'හඳුනාගත නොහැකි රෝගයක්' : 'Disease Not Identified',
    symptoms: lang === 'si' ? 'පැහැදිලි රෝග ලක්ෂණ නොමැත' : 'No clear disease symptoms detected',
    chemical: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Please consult an agriculture officer',
    organic: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Please consult an agriculture officer',
    prevention: lang === 'si' ? 'හොඳ ආලෝකයකදී කොළයක් scan කරන්න' : 'Try scanning a leaf in good lighting'
  });
} else {
  setResult({ disease: diseaseName, confidence });
  setTreatment(treatmentData);
}
    setPredicting(false);
    setStep('result');
  };

  // Voice output
  const speakResult = () => {
    if (!treatment) return;
    const text = lang === 'si'
      ? `රෝගය: ${treatment.name}. රෝග ලක්ෂණ: ${treatment.symptoms}. ප්‍රතිකාර: ${treatment.chemical}`
      : `Disease: ${treatment.name}. Symptoms: ${treatment.symptoms}. Treatment: ${treatment.chemical}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'si' ? 'si-LK' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Reset
  const handleReset = () => {
    setStep('crop');
    setSelectedCrop(null);
    setModel(null);
    setResult(null);
    setTreatment(null);
    setCapturedImage(null);
  };

  useEffect(() => {
  if (cropFromUrl) {
    setStep('camera');
    loadModel(cropFromUrl).then(loadedModel => {
      if (loadedModel) startCamera();
    });
  }
  return () => stopCamera();
}, []);

  // ── STEP 1: Crop Selection ──
  if (step === 'crop') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F9FBF7' }}>
        <div className="px-6 pt-12 pb-8 text-white" style={{ background: 'linear-gradient(to bottom, #1B5E20, #4CAF50)' }}>
          <h1 className="text-3xl font-bold mb-1">{lang === 'si' ? 'බෝගය තෝරන්න' : 'Select Crop'}</h1>
          <p className="text-lg opacity-80">{lang === 'si' ? 'රෝගය හඳුනා ගැනීමට' : 'For disease detection'}</p>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-4">
          {Object.entries(CROPS).map(([key, crop]) => (
            <button
              key={key}
              onClick={() => handleCropSelect(key)}
              className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all"
              style={{ background: '#fff', border: '1.5px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <div className="text-5xl">{crop.emoji}</div>
              <div className="flex-1">
                <div className="text-xl font-semibold" style={{ color: '#1B5E20' }}>
                  {lang === 'si' ? crop.si : crop.en}
                </div>
                <div className="text-sm mt-1" style={{ color: '#757575' }}>
                  {lang === 'si' ? `රෝග ${crop.classes.length}ක්` : `${crop.classes.length} diseases`}
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L13 10L7 16" stroke="#4CAF50" strokeWidth="2"/>
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
      <div className="min-h-screen flex flex-col" style={{ background: '#000' }}>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-10 pb-4">
          <button onClick={handleReset} className="text-white text-2xl">✕</button>
          <div className="px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: 'rgba(46,125,50,0.8)' }}>
            {CROPS[selectedCrop]?.emoji} {lang === 'si' ? CROPS[selectedCrop]?.si : CROPS[selectedCrop]?.en}
          </div>
          <div style={{ width: 32 }} />
        </div>

        {/* Model loading */}
        {modelLoading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin" />
            <p className="text-white text-lg">{lang === 'si' ? 'Model load වෙනවා...' : 'Loading model...'}</p>
          </div>
        )}

        {/* Error */}
        {modelError && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <p className="text-red-400 text-lg text-center">{modelError}</p>
            <button onClick={handleReset} className="px-6 py-3 rounded-xl text-white"
              style={{ background: '#2E7D32' }}>
              {lang === 'si' ? 'නැවත් උත්සාහ කරන්න' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Camera view */}
        {!modelLoading && !modelError && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
              <p className="text-white text-sm opacity-70">
                {lang === 'si' ? 'රෝගී කොළය රාමුව ඇතුළට ගන්න' : 'Place diseased leaf inside frame'}
              </p>
              <div className="relative" style={{ width: 260, height: 260 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: 260, height: 260, borderRadius: 16, objectFit: 'cover' }}
                />
                {/* Corner guides */}
                {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],
                  ['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']
                ].map(([pos, border], i) => (
                  <div key={i} className={`absolute ${pos} ${border} border-green-400`}
                    style={{ width: 30, height: 30, borderRadius: 4 }} />
                ))}
              </div>
              <p className="text-white text-xs opacity-50">
                {lang === 'si' ? 'හොඳ ආලෝකය තිබෙන විට ගන්න' : 'Take in good lighting'}
              </p>
            </div>

            {/* Capture button */}
            <div className="flex items-center justify-center pb-12 gap-8">
              <div style={{ width: 48 }} />
              <button
                onClick={captureAndPredict}
                disabled={predicting}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: predicting ? '#81C784' : '#fff',
                  border: '4px solid rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {predicting
                  ? <div className="w-8 h-8 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
                  : <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#4CAF50' }} />
                }
              </button>
              <div style={{ width: 48 }} />
            </div>
          </>
        )}
      </div>
    );
  }

  // ── STEP 3: Results ──
  if (step === 'result' && treatment) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#F9FBF7' }}>

        {/* Header */}
        <div className="px-6 pt-10 pb-6 text-white" style={{ background: 'linear-gradient(to bottom, #1B5E20, #4CAF50)' }}>
          <p className="text-sm opacity-80 mb-1">{lang === 'si' ? 'හඳුනාගත් රෝගය' : 'Detected Disease'}</p>
          <h1 className="text-2xl font-bold mb-3">{treatment.name}</h1>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }}>
              <div className="h-2 rounded-full" style={{ background: '#FDD835', width: `${result.confidence}%` }} />
            </div>
            <span className="text-sm font-bold" style={{ color: '#FDD835' }}>{result.confidence}%</span>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">

          {/* Captured image */}
          {capturedImage && (
            <div className="rounded-2xl overflow-hidden" style={{ height: 180 }}>
              <img src={capturedImage} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Symptoms */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #ffebee' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C62828' }} />
              <span className="font-semibold text-sm" style={{ color: '#C62828' }}>
                {lang === 'si' ? 'රෝග ලක්ෂණ' : 'Symptoms'}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#555', lineHeight: 1.6 }}>{treatment.symptoms}</p>
          </div>

          {/* Chemical treatment */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e3f2fd' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1565C0' }} />
              <span className="font-semibold text-sm" style={{ color: '#1565C0' }}>
                {lang === 'si' ? 'රසායනික ප්‍රතිකාර' : 'Chemical Treatment'}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#555', lineHeight: 1.6 }}>{treatment.chemical}</p>
          </div>

          {/* Organic treatment */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e8f5e9' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E7D32' }} />
              <span className="font-semibold text-sm" style={{ color: '#2E7D32' }}>
                {lang === 'si' ? 'කාබනික ප්‍රතිකාර' : 'Organic Treatment'}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#555', lineHeight: 1.6 }}>{treatment.organic}</p>
          </div>

          {/* Prevention */}
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #fff3e0' }}>
            <div className="flex items-center gap-2 mb-2">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E65100' }} />
              <span className="font-semibold text-sm" style={{ color: '#E65100' }}>
                {lang === 'si' ? 'වැළැක්වීම' : 'Prevention'}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#555', lineHeight: 1.6 }}>{treatment.prevention}</p>
          </div>

          {/* Voice button */}
          <button
            onClick={speakResult}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3"
            style={{ background: '#E8F5E9', border: '1.5px solid #c8e6c9' }}
          >
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#2E7D32' }} />
            <span className="font-semibold" style={{ color: '#2E7D32' }}>
              {lang === 'si' ? 'හඬින් කියවන්න' : 'Read Aloud'}
            </span>
          </button>

          {/* Scan again */}
          <button
            onClick={handleReset}
            className="w-full py-4 rounded-2xl text-white font-semibold"
            style={{ background: 'linear-gradient(to right, #1B5E20, #4CAF50)' }}
          >
            {lang === 'si' ? 'නැවත ස්කෑන් කරන්න' : 'Scan Again'}
          </button>

        </div>
      </div>
    );
  }

  return null;
}