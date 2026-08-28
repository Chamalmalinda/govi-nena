import localforage from 'localforage';
import { treatments, getTreatment } from './treatments/index';

const TREATMENTS_KEY = 'govi_nena_treatments';
const MODELS_KEY = 'govi_nena_models';

// treatments cache 
export async function cacheTreatments() {
  try {
    await localforage.setItem(TREATMENTS_KEY, treatments);
    console.log('✅ Treatments cached offline!');
    return true;
  } catch (err) {
    console.error('❌ Cache failed:', err);
    return false;
  }
}

// cached treatments 
export async function getCachedTreatments() {
  try {
    const cached = await localforage.getItem(TREATMENTS_KEY);
    if (cached) return cached;
    return treatments;
  } catch {
    return treatments;
  }
}

// disease treatment 
export async function getTreatmentOffline(crop, disease, lang = 'si') {
  try {
    const cached = await localforage.getItem(TREATMENTS_KEY);
    const data = cached || treatments;

    const cropData = data[crop];
    if (!cropData) return getUnknownFallback(lang);

    const diseaseData = cropData[disease];
    if (!diseaseData) return getUnknownFallback(lang);

    return diseaseData[lang] || diseaseData['en'];
  } catch {

    return getTreatment(crop, disease, lang);
  }
}

// model cache status check
export async function checkModelCache(cropName) {
  try {
    const cached = await localforage.getItem(`${MODELS_KEY}_${cropName}`);
    return !!cached;
  } catch {
    return false;
  }
}

// cache clear 
export async function clearCache() {
  try {
    await localforage.clear();
    console.log('✅ Cache cleared!');
    return true;
  } catch {
    return false;
  }
}

// Unknown disease fallback
function getUnknownFallback(lang) {
  return {
    name: lang === 'si' ? 'හඳුනා නොගත් රෝගය' : 'Unknown Disease',
    symptoms: lang === 'si' ? 'දත්ත නොමැත' : 'No data available',
    chemical: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Consult an agriculture officer',
    organic: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Consult an agriculture officer',
    prevention: lang === 'si' ? 'නිතිපතා නිරීක්ෂණය කරන්න' : 'Regular monitoring recommended'
  };
}