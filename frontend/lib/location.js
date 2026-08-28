
//localStorage keys
export const GPS_COORDS_KEY = 'govi_nena_gps_coords';
export const GPS_PERMISSION_KEY = 'govi_nena_location_permission';

const GPS_CACHE_MAX_AGE_MS = 10 * 60 * 1000; 


export const DISTRICT_CENTROIDS = {
  Colombo: [79.8612, 6.9271],
  Gampaha: [79.9925, 7.084],
  Kalutara: [79.9733, 6.5854],
  Kandy: [80.635, 7.2906],
  Matale: [80.6234, 7.4675],
  'Nuwara Eliya': [80.7891, 6.9497],
  Galle: [80.217, 6.0535],
  Matara: [80.5, 5.95],
  Hambantota: [81.1185, 6.1246],
  Jaffna: [80.0074, 9.6615],
  Mannar: [79.9142, 8.9811],
  Vavuniya: [80.4982, 8.7542],
  Anuradhapura: [80.3947, 8.3122],
  Polonnaruwa: [81.0006, 7.9397],
  Kurunegala: [80.3647, 7.4864],
  Puttalam: [79.8275, 8.033],
  Badulla: [81.0556, 6.9934],
  Monaragala: [81.35, 6.87],
  Ratnapura: [80.4037, 6.6828],
  Kegalle: [80.3424, 7.2513],
  Trincomalee: [81.2335, 8.5873],
  Batticaloa: [81.6924, 7.7102],
  Ampara: [81.6747, 7.2912],
  Kilinochchi: [80.3982, 9.3803],
  Mullaitivu: [80.8142, 9.2671],
};


export function getCachedGPSCoords() {
  try {
    const raw = localStorage.getItem(GPS_COORDS_KEY);
    if (!raw) return null;

    const { coords, timestamp } = JSON.parse(raw);

    if (
      !Array.isArray(coords) ||
      coords.length !== 2 ||
      Date.now() - timestamp > GPS_CACHE_MAX_AGE_MS
    ) {
      return null;
    }

    return coords; // [lng, lat]
  } catch {
    return null;
  }
}
//Saves GPS coordinates to localStorage with the current timestamp.

export function saveGPSCoords(coords) {
  try {
    localStorage.setItem(
      GPS_COORDS_KEY,
      JSON.stringify({ coords, timestamp: Date.now() })
    );
  } catch {
   
  }
}

export function clearGPSState() {
  try {
    localStorage.removeItem(GPS_COORDS_KEY);
    localStorage.removeItem(GPS_PERMISSION_KEY);
  } catch {

  }
}


export function getGPSPermissionStatus() {
  try {
    const status = localStorage.getItem(GPS_PERMISSION_KEY);
    if (
      status === 'granted' ||
      status === 'denied' ||
      status === 'skipped'
    ) {
      return status;
    }
  } catch {
    // Ignore.
  }
  return 'prompt';
}

export function setGPSPermissionStatus(status) {
  try {
    localStorage.setItem(GPS_PERMISSION_KEY, status);
  } catch {

  }
}

const SINHALA_DISTRICT_MAP = {
  "කොළඹ": "Colombo",
  "ගම්පහ": "Gampaha",
  "කළුතර": "Kalutara",
  "මහනුවර": "Kandy",
  "මාතලේ": "Matale",
  "නුවරඑළිය": "Nuwara Eliya",
  "ගාල්ල": "Galle",
  "මාතර": "Matara",
  "හම්බන්තොට": "Hambantota",
  "යාපනය": "Jaffna",
  "මන්නාරම": "Mannar",
  "වවුනියාව": "Vavuniya",
  "අනුරාධපුර": "Anuradhapura",
  "පොළොන්නරුව": "Polonnaruwa",
  "කුරුණෑගල": "Kurunegala",
  "පුත්තලම": "Puttalam",
  "බදුල්ල": "Badulla",
  "මොණරාගල": "Monaragala",
  "රත්නපුර": "Ratnapura",
  "කෑගල්ල": "Kegalle",
  "ත්‍රිකුණාමලය": "Trincomalee",
  "මඩකළපුව": "Batticaloa",
  "අම්පාර": "Ampara",
  "කිලිනොච්චිය": "Kilinochchi",
  "මුලතිව්": "Mullaitivu"
};


export function getDistrictCoords(district) {
  if (!district) return DISTRICT_CENTROIDS['Kandy'];
  
  const trimmed = district.trim();
  

  const englishName = SINHALA_DISTRICT_MAP[trimmed] || trimmed;
  

  const normalizedKey = Object.keys(DISTRICT_CENTROIDS).find(
    (key) => key.toLowerCase() === englishName.toLowerCase()
  );
  
  return normalizedKey ? DISTRICT_CENTROIDS[normalizedKey] : DISTRICT_CENTROIDS['Kandy'];
}

export function getBestCoords(userDistrict) {
  const gps = getCachedGPSCoords();
  if (gps) return { coords: gps, source: 'gps' };
  return { coords: getDistrictCoords(userDistrict), source: 'district' };
}


const LAST_USER_KEY = 'govi_nena_last_user_id';
export function getLastUserId() {
  try {
    return localStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
}


export function setLastUserId(userId) {
  try {
    localStorage.setItem(LAST_USER_KEY, String(userId));
  } catch {
    // Ignore.
  }
}


export function getUserStorageKey(baseKey) {
  try {
    const storedUser = localStorage.getItem('govi_nena_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const userId = parsed._id || parsed.id;
      if (userId) return `${baseKey}_${userId}`;
    }
  } catch {

  }
  return baseKey;
}
