import { paddyTreatments } from './paddy';
import { tomatoTreatments } from './tomato';
import { chiliTreatments } from './chili';

export const treatments = {
  paddy: paddyTreatments,
  tomato: tomatoTreatments,
  chili: chiliTreatments
};

export function getTreatment(crop, disease, lang = 'si') {
  try {
    const cropData = treatments[crop];
    if (!cropData) return getUnknownTreatment(lang);

    const diseaseData = cropData[disease];
    if (!diseaseData) return getUnknownTreatment(lang);

    return diseaseData[lang] || diseaseData['en'];
  } catch {
    return getUnknownTreatment(lang);
  }
}

function getUnknownTreatment(lang) {
  return {
    name: lang === 'si' ? 'හඳුනා නොගත් රෝගය' : 'Unknown Disease',
    symptoms: lang === 'si' ? 'දත්ත නොමැත' : 'No data available',
    chemical: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Consult an agriculture officer',
    organic: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Consult an agriculture officer',
    prevention: lang === 'si' ? 'නිතිපතා නිරීක්ෂණය කරන්න' : 'Regular monitoring recommended'
  };
}