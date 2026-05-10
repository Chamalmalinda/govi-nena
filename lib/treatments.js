export const treatments = {
  // ── PADDY ──────────────────────────────────────────
  paddy: {
    blast: {
      si: {
        name: "Blast රෝගය",
        symptoms: "දියමන්ති හැඩැති ලප, අළු මැද, දුඹුරු කොණ සහිත කොළ",
        chemical: "Tricyclazole 75% WP — වතුර ලීටර 20ට ග්‍රෑ 20 බැගින් ඉසින්න",
        organic: "නිම් ද්‍රාවණය හෝ කහ ජලය ඉසීම",
        prevention: "ප්‍රතිරෝධී ප්‍රභේද භාවිතා කරන්න, අධික නයිට්‍රජන් යෙදීම වළකින්න"
      },
      en: {
        name: "Blast Disease",
        symptoms: "Diamond-shaped lesions with gray centers and brown borders on leaves",
        chemical: "Tricyclazole 75% WP — 20g per 20L water, spray evenly",
        organic: "Spray neem solution or turmeric water",
        prevention: "Use resistant varieties, avoid excessive nitrogen application"
      }
    },
    brown_spot: {
      si: {
        name: "දුඹුරු ලප රෝගය",
        symptoms: "කොළ මත දුඹුරු ඕවල් හැඩැති ලප",
        chemical: "Mancozeb 75% WP — වතුර ලීටර 20ට ග්‍රෑ 40 බැගින් ඉසින්න",
        organic: "ලී අළු ද්‍රාවණය ඉසීම",
        prevention: "පොහොර නිවැරදිව යෙදීම, ජල කළමනාකරණය"
      },
      en: {
        name: "Brown Spot",
        symptoms: "Brown oval-shaped spots on leaves",
        chemical: "Mancozeb 75% WP — 40g per 20L water",
        organic: "Spray wood ash solution",
        prevention: "Proper fertilizer application, water management"
      }
    },
    bacterial_leaf_blight: {
      si: {
        name: "බැක්ටීරියා කොළ අස්වනු රෝගය",
        symptoms: "කොළ කෙළවරේ සිට කහ-දුඹුරු වීම",
        chemical: "Copper Oxychloride 50% WP — ලීටර 20ට ග්‍රෑ 30",
        organic: "හැළිකි ජලය ඉසීම",
        prevention: "දූෂිත බීජ භාවිතා නොකරන්න"
      },
      en: {
        name: "Bacterial Leaf Blight",
        symptoms: "Yellowing from leaf tips turning brown",
        chemical: "Copper Oxychloride 50% WP — 30g per 20L water",
        organic: "Spray lime water",
        prevention: "Avoid infected seeds"
      }
    },
    bacterial_leaf_streak: {
      si: {
        name: "බැක්ටීරියා කොළ රේඛා රෝගය",
        symptoms: "කොළ ඔස්සේ ජල ගැළී ගිය රේඛා",
        chemical: "Streptomycin Sulphate — ලීටර 20ට ග්‍රෑ 10",
        organic: "නිම් කොළ ද්‍රාවණය",
        prevention: "ජල කළමනාකරණය, සෞඛ්‍ය සම්පන්න බීජ"
      },
      en: {
        name: "Bacterial Leaf Streak",
        symptoms: "Water-soaked streaks along leaves",
        chemical: "Streptomycin Sulphate — 10g per 20L water",
        organic: "Neem leaf solution",
        prevention: "Water management, healthy seeds"
      }
    },
    bacterial_panicle_blight: {
      si: {
        name: "බැක්ටීරියා පිනිකල් රෝගය",
        symptoms: "කරල් කළු වී හිස් ධාන්‍ය",
        chemical: "Copper Hydroxide — ලීටර 20ට ග්‍රෑ 25",
        organic: "ශ්‍රී ජෛව ද්‍රාවණය",
        prevention: "ප්‍රතිරෝධී ප්‍රභේද, නිවැරදි කාල පිරිනැමීම"
      },
      en: {
        name: "Bacterial Panicle Blight",
        symptoms: "Blackened panicles and empty grains",
        chemical: "Copper Hydroxide — 25g per 20L water",
        organic: "Bio solution spray",
        prevention: "Resistant varieties, proper timing"
      }
    },
    downy_mildew: {
      si: {
        name: "Downy Mildew රෝගය",
        symptoms: "කොළ යට ගොරෝසු සුදු ස්ථරය",
        chemical: "Metalaxyl 8% + Mancozeb 64% — ලීටර 20ට ග්‍රෑ 25",
        organic: "බේකින් සෝඩා ද්‍රාවණය",
        prevention: "හොඳ වාතාශ්‍රය, ඉහළ ආර්ද්‍රතාවය වළකින්න"
      },
      en: {
        name: "Downy Mildew",
        symptoms: "Rough white layer under leaves",
        chemical: "Metalaxyl 8% + Mancozeb 64% — 25g per 20L water",
        organic: "Baking soda solution",
        prevention: "Good ventilation, avoid high humidity"
      }
    },
    hispa: {
      si: {
        name: "Hispa කෘමියා",
        symptoms: "කොළ මත සුදු ඉරි, කෘමි හානි",
        chemical: "Chlorpyrifos 20% EC — ලීටර 20ට මිලි 30",
        organic: "නිම් තෙල් ඉසීම",
        prevention: "කෙත් පිරිසිදුව තබාගන්න"
      },
      en: {
        name: "Hispa",
        symptoms: "White streaks on leaves, insect damage",
        chemical: "Chlorpyrifos 20% EC — 30ml per 20L water",
        organic: "Neem oil spray",
        prevention: "Keep field clean"
      }
    },
    tungro: {
      si: {
        name: "Tungro රෝගය",
        symptoms: "කොළ කහ-තැඹිලි වීම, වර්ධනය මන්දගාමී",
        chemical: "Imidacloprid 17.8% SL — ලීටර 20ට මිලි 5 (දිළිඳු කෘමි පාලනය)",
        organic: "කහ ඇලෙනසුලු උගුල් ස්ථාපනය",
        prevention: "දිළිඳු කෘමි (vector) පාලනය, ප්‍රතිරෝධී ප්‍රභේද"
      },
      en: {
        name: "Tungro Disease",
        symptoms: "Yellow-orange discoloration, stunted growth",
        chemical: "Imidacloprid 17.8% SL — 5ml per 20L (leafhopper control)",
        organic: "Yellow sticky traps",
        prevention: "Leafhopper control, resistant varieties"
      }
    },
    dead_heart: {
      si: {
        name: "Dead Heart රෝගය",
        symptoms: "ශාකයේ මධ්‍ය කොළය මළ, ඒ වටේ සෞඛ්‍ය සම්පන්න",
        chemical: "Carbofuran 3G — හෙක්ටයාරයකට කිලෝ 15",
        organic: "ශාක අළු කෙතට යෙදීම",
        prevention: "කෘමි ඩිම්බ නිරීක්ෂණය, කාලෝචිත රෝපණය"
      },
      en: {
        name: "Dead Heart",
        symptoms: "Central leaf dead, surrounding leaves healthy",
        chemical: "Carbofuran 3G — 15kg per hectare",
        organic: "Apply plant ash to field",
        prevention: "Monitor egg masses, timely planting"
      }
    },
    normal: {
      si: {
        name: "සෞඛ්‍ය සම්පන්න වී ශාකය",
        symptoms: "රෝග ලක්ෂණ නොමැත",
        chemical: "ප්‍රතිකාර අවශ්‍ය නොවේ",
        organic: "නිතිපතා නිරීක්ෂණය කරන්න",
        prevention: "සෞඛ්‍ය සම්පන්න පරිචයන් දිගටම කරගෙන යන්න"
      },
      en: {
        name: "Healthy Paddy Plant",
        symptoms: "No disease symptoms detected",
        chemical: "No treatment required",
        organic: "Regular monitoring recommended",
        prevention: "Continue healthy farming practices"
      }
    },
  },

  // ── TOMATO ─────────────────────────────────────────
  tomato: {
    'Tomato___Bacterial_spot': {
      si: {
        name: "තක්කාලි බැක්ටීරියා ලප",
        symptoms: "කොළ මත කළු ජල ගැළී ගිය ලප, පළතුරු මත ඇති ලප",
        chemical: "Copper Oxychloride — ලීටර 20ට ග්‍රෑ 30",
        organic: "නිම් ද්‍රාවණය ඉසීම",
        prevention: "රෝග රහිත බීජ, නිවැරදි වාරිමාර්ග"
      },
      en: {
        name: "Bacterial Spot",
        symptoms: "Dark water-soaked spots on leaves, spots on fruits",
        chemical: "Copper Oxychloride — 30g per 20L water",
        organic: "Neem solution spray",
        prevention: "Disease-free seeds, proper irrigation"
      }
    },
    'Tomato___Early_blight': {
      si: {
        name: "තක්කාලි Early Blight",
        symptoms: "ඉලක්කම් හැඩැති ලප, කහ වළල්ල",
        chemical: "Mancozeb 75% WP — ලීටර 20ට ග්‍රෑ 40",
        organic: "බේකින් සෝඩා + නිම් තෙල් ද්‍රාවණය",
        prevention: "කොළ තෙත් නොවන ලෙස වාරිමාර්ග, කෙළවරට ගෙවුණු කොළ ඉවත් කිරීම"
      },
      en: {
        name: "Early Blight",
        symptoms: "Target-shaped spots with yellow halo",
        chemical: "Mancozeb 75% WP — 40g per 20L water",
        organic: "Baking soda + neem oil solution",
        prevention: "Avoid wetting leaves, remove old leaves"
      }
    },
    'Tomato___Late_blight': {
      si: {
        name: "තක්කාලි Late Blight",
        symptoms: "කොළ මත ජල ගැළී ගිය ලප, සුදු දිලීරය යට",
        chemical: "Metalaxyl + Mancozeb — ලීටර 20ට ග්‍රෑ 25",
        organic: "Bordeaux mixture ඉසීම",
        prevention: "හොඳ වාතාශ්‍රය, ඉහළ ආර්ද්‍රතාවය වළකින්න"
      },
      en: {
        name: "Late Blight",
        symptoms: "Water-soaked spots on leaves, white mold underneath",
        chemical: "Metalaxyl + Mancozeb — 25g per 20L water",
        organic: "Bordeaux mixture spray",
        prevention: "Good ventilation, avoid high humidity"
      }
    },
    'Tomato___Leaf_Mold': {
      si: {
        name: "තක්කාලි Leaf Mold",
        symptoms: "කොළ මත කහ ලප, යට ජාලාකාර දිලීරය",
        chemical: "Chlorothalonil 75% WP — ලීටර 20ට ග්‍රෑ 30",
        organic: "නිම් ද්‍රාවණය",
        prevention: "හොඳ වාතාශ්‍රය, ආර්ද්‍රතාවය අඩු කිරීම"
      },
      en: {
        name: "Leaf Mold",
        symptoms: "Yellow spots on leaves, mold growth underneath",
        chemical: "Chlorothalonil 75% WP — 30g per 20L water",
        organic: "Neem solution",
        prevention: "Good ventilation, reduce humidity"
      }
    },
    'Tomato___Septoria_leaf_spot': {
      si: {
        name: "Septoria Leaf Spot",
        symptoms: "කළු කොණ සහිත කුඩා සුදු ලප",
        chemical: "Mancozeb 75% WP — ලීටර 20ට ග්‍රෑ 40",
        organic: "Copper soap spray",
        prevention: "කොළ නොතෙමා ජලය දීම, කාබනික mulch"
      },
      en: {
        name: "Septoria Leaf Spot",
        symptoms: "Small white spots with dark borders",
        chemical: "Mancozeb 75% WP — 40g per 20L water",
        organic: "Copper soap spray",
        prevention: "Avoid wetting leaves, organic mulch"
      }
    },
    'Tomato___Spider_mites Two-spotted_spider_mite': {
      si: {
        name: "Spider Mite හානිය",
        symptoms: "කොළ මත කහ ලප, සිහින් ජාලාව",
        chemical: "Abamectin 1.8% EC — ලීටර 20ට මිලි 10",
        organic: "නිම් තෙල් + සබන් ද්‍රාවණය",
        prevention: "ශාක නිතිපතා ජලය ඉසීම, ස්වාභාවික සතුරන් ආරක්ෂා කිරීම"
      },
      en: {
        name: "Spider Mite Damage",
        symptoms: "Yellow spots on leaves, fine webbing",
        chemical: "Abamectin 1.8% EC — 10ml per 20L water",
        organic: "Neem oil + soap solution",
        prevention: "Regular misting, protect natural predators"
      }
    },
    'Tomato___Target_Spot': {
      si: {
        name: "Target Spot රෝගය",
        symptoms: "ඉලක්කම් හැඩැති ලප, දුඹුරු-කළු",
        chemical: "Azoxystrobin 23% SC — ලීටර 20ට මිලි 10",
        organic: "නිම් ද්‍රාවණය",
        prevention: "ශාක ඝනත්වය අඩු කිරීම"
      },
      en: {
        name: "Target Spot",
        symptoms: "Target-shaped brown-black spots",
        chemical: "Azoxystrobin 23% SC — 10ml per 20L water",
        organic: "Neem solution",
        prevention: "Reduce plant density"
      }
    },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
      si: {
        name: "Yellow Leaf Curl Virus",
        symptoms: "කොළ කහ වී රොල් වීම, ශාක වර්ධනය අඩු",
        chemical: "Imidacloprid — ලීටර 20ට මිලි 5 (සුදු මැස්සන් පාලනය)",
        organic: "කහ ඇලෙනසුලු උගුල්",
        prevention: "සුදු මැස්සන් (whitefly) පාලනය, ජාල භාවිතය"
      },
      en: {
        name: "Yellow Leaf Curl Virus",
        symptoms: "Yellowing and curling of leaves, stunted growth",
        chemical: "Imidacloprid — 5ml per 20L (whitefly control)",
        organic: "Yellow sticky traps",
        prevention: "Whitefly control, use netting"
      }
    },
    'Tomato___Tomato_mosaic_virus': {
      si: {
        name: "Mosaic Virus රෝගය",
        symptoms: "කොළ මත හරිත-කහ මොසෙයික් රටාව",
        chemical: "ෆිප්‍රොනිල් — ලීටර 20ට මිලි 10 (aphid පාලනය)",
        organic: "නිම් ද්‍රාවණය",
        prevention: "දූෂිත ශාක ඉවත් කිරීම, aphid පාලනය"
      },
      en: {
        name: "Mosaic Virus",
        symptoms: "Green-yellow mosaic pattern on leaves",
        chemical: "Fipronil — 10ml per 20L (aphid control)",
        organic: "Neem solution",
        prevention: "Remove infected plants, aphid control"
      }
    },
    'Tomato___healthy': {
      si: {
        name: "සෞඛ්‍ය සම්පන්න තක්කාලි",
        symptoms: "රෝග ලක්ෂණ නොමැත",
        chemical: "ප්‍රතිකාර අවශ්‍ය නොවේ",
        organic: "නිතිපතා නිරීක්ෂණය",
        prevention: "සෞඛ්‍ය සම්පන්න පරිචයන් දිගටම කරගෙන යන්න"
      },
      en: {
        name: "Healthy Tomato",
        symptoms: "No disease symptoms detected",
        chemical: "No treatment required",
        organic: "Regular monitoring",
        prevention: "Continue healthy farming practices"
      }
    },
  },

  // ── CHILI ──────────────────────────────────────────
  chili: {
    'Bacterial Spot': {
      si: {
        name: "මිරිස් බැක්ටීරියා ලප",
        symptoms: "කොළ මත කළු ජල ගැළී ගිය ලප",
        chemical: "Copper Oxychloride — ලීටර 20ට ග්‍රෑ 30",
        organic: "නිම් ද්‍රාවණය",
        prevention: "රෝග රහිත බීජ, නිවැරදි ජල කළමනාකරණය"
      },
      en: {
        name: "Bacterial Spot",
        symptoms: "Dark water-soaked spots on leaves",
        chemical: "Copper Oxychloride — 30g per 20L water",
        organic: "Neem solution",
        prevention: "Disease-free seeds, proper water management"
      }
    },
    'Cercospora Leaf Spot': {
      si: {
        name: "Cercospora Leaf Spot",
        symptoms: "කළු කොණ සහිත අළු-සුදු ලප",
        chemical: "Mancozeb 75% WP — ලීටර 20ට ග්‍රෑ 40",
        organic: "Bordeaux mixture",
        prevention: "හොඳ වාතාශ්‍රය, ඝනත්වය අඩු කිරීම"
      },
      en: {
        name: "Cercospora Leaf Spot",
        symptoms: "Gray-white spots with dark borders",
        chemical: "Mancozeb 75% WP — 40g per 20L water",
        organic: "Bordeaux mixture",
        prevention: "Good ventilation, reduce density"
      }
    },
    'Curl Virus': {
      si: {
        name: "Curl Virus රෝගය",
        symptoms: "කොළ රොල් වීම, කහ වීම, ශාක වර්ධනය මන්දගාමී",
        chemical: "Imidacloprid — ලීටර 20ට මිලි 5",
        organic: "කහ ඇලෙනසුලු උගුල්",
        prevention: "Vector කෘමීන් පාලනය, ජාල භාවිතය"
      },
      en: {
        name: "Curl Virus",
        symptoms: "Leaf curling, yellowing, stunted growth",
        chemical: "Imidacloprid — 5ml per 20L water",
        organic: "Yellow sticky traps",
        prevention: "Vector insect control, use netting"
      }
    },
    'Healthy Leaf': {
      si: {
        name: "සෞඛ්‍ය සම්පන්න මිරිස්",
        symptoms: "රෝග ලක්ෂණ නොමැත",
        chemical: "ප්‍රතිකාර අවශ්‍ය නොවේ",
        organic: "නිතිපතා නිරීක්ෂණය",
        prevention: "සෞඛ්‍ය සම්පන්න පරිචයන් දිගටම කරගෙන යන්න"
      },
      en: {
        name: "Healthy Chili",
        symptoms: "No disease symptoms detected",
        chemical: "No treatment required",
        organic: "Regular monitoring",
        prevention: "Continue healthy farming practices"
      }
    },
    'Nutrition Deficiency': {
      si: {
        name: "පෝෂණ ඌනතාවය",
        symptoms: "කොළ කහ වීම, දළු දුර්වල වීම",
        chemical: "NPK 19:19:19 — ලීටර 20ට ග්‍රෑ 20 foliar spray",
        organic: "කොම්පෝස්ට් සහ vermicompost යෙදීම",
        prevention: "නිතිපතා පොහොර පරීක්ෂාව සහ සමතුලිත පෝෂණය"
      },
      en: {
        name: "Nutrition Deficiency",
        symptoms: "Leaf yellowing, weak shoots",
        chemical: "NPK 19:19:19 — 20g per 20L foliar spray",
        organic: "Apply compost and vermicompost",
        prevention: "Regular soil testing and balanced nutrition"
      }
    },
    'White spot': {
      si: {
        name: "සුදු ලප රෝගය",
        symptoms: "කොළ මත කුඩා සුදු ලප",
        chemical: "Hexaconazole 5% EC — ලීටර 20ට මිලි 10",
        organic: "නිම් ද්‍රාවණය + කහ",
        prevention: "ශාක ඝනත්වය අඩු කිරීම, හොඳ වාතාශ්‍රය"
      },
      en: {
        name: "White Spot",
        symptoms: "Small white spots on leaves",
        chemical: "Hexaconazole 5% EC — 10ml per 20L water",
        organic: "Neem solution + turmeric",
        prevention: "Reduce plant density, good ventilation"
      }
    },
  }
};

export function getTreatment(crop, disease, lang = 'si') {
  try {
    return treatments[crop][disease][lang] || treatments[crop][disease]['en'];
  } catch {
    return {
      name: lang === 'si' ? 'හඳුනා නොගත් රෝගය' : 'Unknown Disease',
      symptoms: lang === 'si' ? 'දත්ත නොමැත' : 'No data available',
      chemical: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Consult agriculture officer',
      organic: lang === 'si' ? 'කෘෂිකර්ම නිලධාරියකු හමුවන්න' : 'Consult agriculture officer',
      prevention: lang === 'si' ? 'නිතිපතා නිරීක්ෂණය කරන්න' : 'Regular monitoring'
    };
  }
}