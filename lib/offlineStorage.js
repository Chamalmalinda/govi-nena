import localforage from 'localforage';
import { treatments } from './treatments';

const TREATMENTS_KEY = 'govi_nena_treatments';
const MODELS_KEY = 'govi_nena_models';

// treatments cache කරන්න
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

// cached treatments ගන්න
export async function getCachedTreatments() {
  try {
    const cached = await localforage.getItem(TREATMENTS_KEY);
    if (cached) return cached;
    // cache නෑ නම් treatments.js ලෙන් directly return
    return treatments;
  } catch {
    return treatments;
  }
}

// disease treatment ගන්න
export async function getTreatmentOffline(crop, disease, lang = 'si') {
  const data = await getCachedTreatments();
  try {
    return data[crop][disease][lang] || data[crop][disease]['en'];
  } catch {
    return {
      name: lang === 'si' ? 'හඳුනා නොගත් රෝගය' : 'Unknown Disease',
      symptoms: lang === 'si' ? 'දත්ත නොමැත' : 'No data available',
      chemical: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Consult agriculture officer',
      organic: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Consult agriculture officer',
      prevention: lang === 'si' ? 'නිතිපතා නිරීක්ෂණය' : 'Regular monitoring'
    };
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

// cache clear කරන්න
export async function clearCache() {
  try {
    await localforage.clear();
    console.log('✅ Cache cleared!');
    return true;
  } catch {
    return false;
  }
}