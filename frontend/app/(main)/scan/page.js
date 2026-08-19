"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ImagePlus,
  LoaderCircle,
  MapPinned,
  RefreshCw,
  Speaker,
  X,
} from "lucide-react";

import {
  GiChiliPepper,
  GiTomato,
  GiWheat,
} from "react-icons/gi";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useModel } from "@/hooks/useModel";
import { getTreatmentOffline } from "@/lib/offlineStorage";
import {
  getCachedGPSCoords,
  getDistrictCoords,
  getUserStorageKey,
} from "@/lib/location";

const scanText = {
  si: {
    changeLanguage: "භාෂාව වෙනස් කරන්න",

    onlyScanLeaves: "පත්‍ර පමණක් ස්කෑන් කරන්න",
    placeLeaf: "රෝගී කොළය රාමුව ඇතුළත තබන්න",
    goodLight:
      "හොඳ ආලෝකයක් ඇති ස්ථානයක ඡායාරූපය ගන්න",

    loadingModel: "මොඩලය පූරණය වෙමින්...",
    loadingModelSub:
      "මේ සඳහා මිනිත්තුවක් පමණ ගත විය හැක",

    tryAgain: "නැවත උත්සාහ කරන්න",
    uploadImage: "ඡායාරූපයක් උඩුගත කරන්න",
    captureImage: "ඡායාරූපය ගන්න",
    analysing: "විශ්ලේෂණය වෙමින්...",

    analysisResults: "විශ්ලේෂණ ප්‍රතිඵල",
    analysisResultsSub: "Analysis Results",

    uncertainTitle: "අවිනිශ්චිත ස්කෑන් ප්‍රතිඵලයකි",
    uncertainDescription:
      "මෙම ප්‍රතිඵලය අවිනිශ්චිතය. රසායනික ප්‍රතිකාර භාවිතයට පෙර, වඩා හොඳ ආලෝකයකින් පත්‍රය ආසන්නයෙන් නැවත ස්කෑන් කරන්න.",

    capturedImage: "ග්‍රහණය කළ රූපය",
    match: "ගැළපීම",

    confidence: "විශ්වාසය",
    description: "විස්තරය",

    treatmentSteps: "ප්‍රතිකාර පියවර",
    chemicalTreatment: "රසායනික ප්‍රතිකාර",
    organicTreatment: "කාබනික ප්‍රතිකාර",
    prevention: "වැළැක්වීම",

    uncertainChemical:
      "අවිනිශ්චිත ස්කෑන් ප්‍රතිඵල සඳහා රසායනික ප්‍රතිකාර නිර්දේශ නොකෙරේ. කරුණාකර නැවත ස්කෑන් කරන්න.",

    viewDetails: "සම්පූර්ණ තොරතුරු බලන්න",
    viewDetailsSub: "View Full Details",

    outbreakMap: "ව්‍යාප්ති සිතියම බලන්න",
    outbreakMapSub: "කිලෝමීටර් 5 ඇතුළත වාර්තා බලන්න",

    scanAgain: "නැවත ස්කෑන් කරන්න",

    unknownName: "හඳුනාගත නොහැකි රෝගයක්",
    unknownSymptoms:
      "පැහැදිලි රෝග ලක්ෂණ හඳුනාගත නොහැක.",
    unknownConsult:
      "කෘෂිකර්ම නිලධාරියෙකුගෙන් උපදෙස් ලබාගන්න.",
    unknownTip:
      "හොඳ ආලෝකයක් ඇති ස්ථානයක පත්‍රයක් නැවත ස්කෑන් කරන්න.",

    cameraError:
      "කැමරාවට ප්‍රවේශ විය නොහැක. ඡායාරූපයක් උඩුගත කරන්න.",

    locationError:
      "ස්කෑන් කළ ස්ථානය සොයාගත නොහැක. කරුණාකර නැවත ස්කෑන් කරන්න.",

    speechDisease: "හඳුනාගත් රෝගය",
    speechSymptoms: "රෝග ලක්ෂණ",
    speechChemical: "රසායනික ප්‍රතිකාර",
    speechOrganic: "කාබනික ප්‍රතිකාර",
    speechPrevention: "වැළැක්වීම",
  },

  en: {
    changeLanguage: "Change language",

    onlyScanLeaves: "Only scan plant leaves",
    placeLeaf: "Place the diseased leaf inside the frame",
    goodLight: "Take the photo in good lighting",

    loadingModel: "Loading model...",
    loadingModelSub: "This may take a minute",

    tryAgain: "Try Again",
    uploadImage: "Upload an image",
    captureImage: "Capture image",
    analysing: "Analysing...",

    analysisResults: "Analysis Results",
    analysisResultsSub: "විශ්ලේෂණ ප්‍රතිඵල",

    uncertainTitle: "Uncertain Scan Result",
    uncertainDescription:
      "This result is uncertain. Before applying chemical treatments, scan the leaf again from a closer distance under better lighting.",

    capturedImage: "Captured Image",
    match: "match",

    confidence: "Confidence",
    description: "Description",

    treatmentSteps: "Treatment Steps",
    chemicalTreatment: "Chemical Treatment",
    organicTreatment: "Organic Treatment",
    prevention: "Prevention",

    uncertainChemical:
      "Chemical recommendations are withheld for uncertain scans. Please scan again.",

    viewDetails: "View Full Details",
    viewDetailsSub: "සම්පූර්ණ තොරතුරු බලන්න",

    outbreakMap: "Check Outbreak Map",
    outbreakMapSub: "View reports within 5 kilometres",

    scanAgain: "Scan Again",

    unknownName: "Disease Not Identified",
    unknownSymptoms: "No clear symptoms were detected.",
    unknownConsult: "Consult an agriculture officer.",
    unknownTip:
      "Try scanning a plant leaf again in good lighting.",

    cameraError:
      "Camera access is unavailable. Upload an image instead.",

    locationError:
      "The scanned location could not be found. Please scan again.",

    speechDisease: "Detected disease",
    speechSymptoms: "Symptoms",
    speechChemical: "Chemical treatment",
    speechOrganic: "Organic treatment",
    speechPrevention: "Prevention",
  },
};

const CROPS = {
  paddy: {
    si: "වී",
    en: "Paddy",
    Icon: GiWheat,

    classes: [
      "bacterial_leaf_blight",
      "bacterial_leaf_streak",
      "bacterial_panicle_blight",
      "blast",
      "brown_spot",
      "dead_heart",
      "downy_mildew",
      "hispa",
      "normal",
      "not_paddy",
      "tungro",
    ],
  },

  tomato: {
    si: "තක්කාලි",
    en: "Tomato",
    Icon: GiTomato,

    classes: [
      "Tomato___Bacterial_spot",
      "Tomato___Early_blight",
      "Tomato___Late_blight",
      "Tomato___Leaf_Mold",
      "Tomato___Septoria_leaf_spot",
      "Tomato___Spider_mites Two-spotted_spider_mite",
      "Tomato___Target_Spot",
      "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
      "Tomato___Tomato_mosaic_virus",
      "Tomato___healthy",
      "not_tomato",
      
    ],
  },

  chili: {
    si: "මිරිස්",
    en: "Chili",
    Icon: GiChiliPepper,

    classes: [
      "Bacterial Spot",
      "Cercospora Leaf Spot",
      "Curl Virus",
      "Healthy Leaf",
      "Nutrition Deficiency",
      "White spot",
      "not_chili",
    ],
  },
};

const processHighResImage = (
  image,
  maxDimension = 800
) =>
  new Promise((resolve, reject) => {
    try {
      const temporaryCanvas =
        document.createElement("canvas");

      const temporaryContext =
        temporaryCanvas.getContext("2d");

      if (!temporaryContext) {
        reject(
          new Error(
            "Could not create image-processing canvas."
          )
        );

        return;
      }

      let width =
        image.naturalWidth || image.width;

      let height =
        image.naturalHeight || image.height;

      if (
        width > maxDimension ||
        height > maxDimension
      ) {
        if (width > height) {
          height = Math.round(
            (height * maxDimension) / width
          );

          width = maxDimension;
        } else {
          width = Math.round(
            (width * maxDimension) / height
          );

          height = maxDimension;
        }
      }

      temporaryCanvas.width = width;
      temporaryCanvas.height = height;

      temporaryContext.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      resolve(
        temporaryCanvas.toDataURL(
          "image/jpeg",
          0.85
        )
      );
    } catch (error) {
      reject(error);
    }
  });

const processHighResFromVideo = (
  video,
  maxDimension = 800
) => {
  const temporaryCanvas =
    document.createElement("canvas");

  const temporaryContext =
    temporaryCanvas.getContext("2d");

  if (!temporaryContext) {
    throw new Error(
      "Could not create video-processing canvas."
    );
  }

  let width = video.videoWidth || 640;
  let height = video.videoHeight || 480;

  if (
    width > maxDimension ||
    height > maxDimension
  ) {
    if (width > height) {
      height = Math.round(
        (height * maxDimension) / width
      );

      width = maxDimension;
    } else {
      width = Math.round(
        (width * maxDimension) / height
      );

      height = maxDimension;
    }
  }

  temporaryCanvas.width = width;
  temporaryCanvas.height = height;

  temporaryContext.drawImage(
    video,
    0,
    0,
    width,
    height
  );

  return temporaryCanvas.toDataURL(
    "image/jpeg",
    0.85
  );
};

function LanguageToggle({
  language,
  onToggle,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`relative h-8 w-[72px] shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
        language === "si"
          ? "bg-[#4CAF50]"
          : "bg-[#888888]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ${
          language === "si"
            ? "left-[3px]"
            : "left-[43px]"
        }`}
      />

      <span
        className={`absolute top-[7px] select-none text-[10px] font-bold text-white transition-all duration-300 ${
          language === "si"
            ? "left-[33px]"
            : "left-[8px]"
        }`}
      >
        {language === "si" ? "සිං" : "EN"}
      </span>
    </button>
  );
}

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cropFromUrl =
    searchParams.get("crop");

  const {
    model,
    loading: modelLoading,
    error: modelError,
    loadModel,
    predict,
  } = useModel();

  const initialCrop =
    cropFromUrl && CROPS[cropFromUrl]
      ? cropFromUrl
      : "tomato";

  const [language, setLanguage] =
    useState("si");

  const [step, setStep] =
    useState("camera");

  const [selectedCrop] =
    useState(initialCrop);

  const [
    capturedImage,
    setCapturedImage,
  ] = useState(null);

  const [predicting, setPredicting] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [treatment, setTreatment] =
    useState(null);

  const [
    cameraError,
    setCameraError,
  ] = useState("");

  const [
    navigationError,
    setNavigationError,
  ] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const coordsRef = useRef(null);

  const text = scanText[language];

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const selectedCropData =
    CROPS[selectedCrop];

  const CropIcon =
    selectedCropData?.Icon || Wheat;

  useEffect(() => {
    try {
      const savedLanguage =
        localStorage.getItem(
          "govi_nena_language"
        );

      if (
        savedLanguage === "si" ||
        savedLanguage === "en"
      ) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error(
        "Could not load language preference:",
        error
      );
    }
  }, []);

  const toggleLanguage = () => {
    const nextLanguage =
      language === "si" ? "en" : "si";

    setLanguage(nextLanguage);

    try {
      localStorage.setItem(
        "govi_nena_language",
        nextLanguage
      );
    } catch (error) {
      console.error(
        "Could not save language preference:",
        error
      );
    }
  };

  /**
   * Returns the best available [longitude, latitude] for the current scan.
   *
   * Priority:
   *   1. Fresh GPS coordinates cached by the home-page permission banner.
   *   2. The centroid of the user’s registered district.
   *
   * The old hardcoded fallback [80.601, 7.901] (North Central Province)
   * has been removed — it produced misleading outbreak data.
   */
  const getCoordinates = async () => {
    // 1. Try the GPS cache written by the home-page location banner.
    const cached = getCachedGPSCoords();
    if (cached) return cached;

    // 2. Fall back to the user’s registered district centroid.
    try {
      const storedUser = JSON.parse(
        localStorage.getItem('govi_nena_user') || '{}'
      );
      return getDistrictCoords(storedUser.district || 'Kandy');
    } catch {
      return getDistrictCoords('Kandy');
    }
  };

  const logOutbreakScan = async (
    diseaseName,
    confidence,
    coordinates
  ) => {
    if (
      diseaseName === "unknown" ||
      diseaseName === "normal" ||
      diseaseName.toLowerCase().startsWith("not_") ||
      diseaseName.toLowerCase().includes("healthy") ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "govi_nena_token"
        );

      const response = await fetch(
        `${apiUrl}/api/outbreaks`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            disease: diseaseName,
            crop: selectedCrop,
            confidence,
            coordinates,
          }),
        }
      );

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({}));

        console.error(
          "Outbreak scan was not recorded:",
          data.message ||
            response.statusText
        );
      }
    } catch (error) {
      console.error(
        "Failed to record outbreak scan:",
        error
      );
    }
  };

  const startCamera = async () => {
    setCameraError("");

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },

            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },
          },
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;
      }
    } catch {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
          });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;
        }
      } catch (error) {
        console.error(
          "Camera access denied:",
          error
        );

        setCameraError(
          text.cameraError
        );
      }
    }
  };

  const stopCamera = () => {
    if (!streamRef.current) {
      return;
    }

    streamRef.current
      .getTracks()
      .forEach((track) => {
        track.stop();
      });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const createUnknownTreatment = () => ({
    name: text.unknownName,
    symptoms: text.unknownSymptoms,
    chemical: text.unknownConsult,
    organic: text.unknownConsult,
    prevention: text.unknownTip,
  });

  const completePrediction = async (
    prediction,
    coordinates,
    imageData
  ) => {
    if (!prediction) {
      setPredicting(false);
      return;
    }

    const {
      disease: diseaseName,
      confidence,
      isUncertain,
    } = prediction;

    coordsRef.current = coordinates;

    try {
      localStorage.setItem(
        getUserStorageKey("govi_nena_last_scan_coords"),
        JSON.stringify(coordinates)
      );

      localStorage.setItem(
        getUserStorageKey("govi_nena_last_scan_crop"),
        selectedCrop
      );
    } catch (error) {
      console.error(
        "Could not save scan location or crop:",
        error
      );
    }

    logOutbreakScan(
      diseaseName,
      confidence,
      coordinates
    );

    let resultMetadata;

    if (diseaseName === "unknown") {
      resultMetadata = {
        disease: "unknown",
        confidence,
        isUncertain: true,
        siName:
          scanText.si.unknownName,
        enName:
          scanText.en.unknownName,
      };

      setTreatment(
        createUnknownTreatment()
      );
    } else {
      const [
        currentLanguageTreatment,
        sinhalaTreatment,
        englishTreatment,
      ] = await Promise.all([
        getTreatmentOffline(
          selectedCrop,
          diseaseName,
          language
        ),

        getTreatmentOffline(
          selectedCrop,
          diseaseName,
          "si"
        ),

        getTreatmentOffline(
          selectedCrop,
          diseaseName,
          "en"
        ),
      ]);

      resultMetadata = {
        disease: diseaseName,
        confidence,
        isUncertain,
        siName:
          sinhalaTreatment.name,
        enName:
          englishTreatment.name,
      };

      setTreatment(
        currentLanguageTreatment
      );
    }

    setResult(resultMetadata);

    try {
      localStorage.setItem(
        getUserStorageKey("govi_nena_last_scan_image"),
        imageData
      );

      localStorage.setItem(
        getUserStorageKey("govi_nena_last_result"),
        JSON.stringify(resultMetadata)
      );

      localStorage.setItem(
        getUserStorageKey("govi_nena_last_scan_crop"),
        selectedCrop
      );

      sessionStorage.setItem(
        "govi_nena_scan_active_result",
        "true"
      );
    } catch (error) {
      console.error(
        "Could not save the scan result:",
        error
      );
    }

    setPredicting(false);
    setStep("result");
  };

  const handleImageUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file || !model) {
      return;
    }

    setPredicting(true);
    setNavigationError("");
    stopCamera();

    const coordinatesPromise =
      getCoordinates();

    const reader = new FileReader();

    reader.onload = (
      loadEvent
    ) => {
      const image = new Image();

      image.onload = async () => {
        try {
          const imageData =
            await processHighResImage(
              image,
              800
            );

          setCapturedImage(
            imageData
          );

          const canvas =
            canvasRef.current;

          const context =
            canvas?.getContext("2d");

          if (!canvas || !context) {
            throw new Error(
              "Prediction canvas is unavailable."
            );
          }

          canvas.width = 224;
          canvas.height = 224;

          context.drawImage(
            image,
            0,
            0,
            224,
            224
          );

          const [
            prediction,
            coordinates,
          ] = await Promise.all([
            predict(
              canvas,
              selectedCrop,
              selectedCropData.classes
            ),

            coordinatesPromise,
          ]);

          await completePrediction(
            prediction,
            coordinates,
            imageData
          );
        } catch (error) {
          console.error(
            "Image prediction failed:",
            error
          );

          setPredicting(false);
        }
      };

      image.onerror = () => {
        console.error(
          "The selected image could not be loaded."
        );

        setPredicting(false);
      };

      image.src =
        loadEvent.target.result;
    };

    reader.onerror = () => {
      console.error(
        "The selected file could not be read."
      );

      setPredicting(false);
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const captureAndPredict =
    async () => {
      if (
        !model ||
        !videoRef.current
      ) {
        return;
      }

      setPredicting(true);
      setNavigationError("");

      try {
        const video =
          videoRef.current;

        const imageData =
          processHighResFromVideo(
            video,
            800
          );

        setCapturedImage(imageData);

        const canvas =
          canvasRef.current;

        const context =
          canvas?.getContext("2d");

        if (!canvas || !context) {
          throw new Error(
            "Prediction canvas is unavailable."
          );
        }

        canvas.width = 224;
        canvas.height = 224;

        context.drawImage(
          video,
          0,
          0,
          224,
          224
        );

        stopCamera();

        const [
          prediction,
          coordinates,
        ] = await Promise.all([
          predict(
            canvas,
            selectedCrop,
            selectedCropData.classes
          ),

          getCoordinates(),
        ]);

        await completePrediction(
          prediction,
          coordinates,
          imageData
        );
      } catch (error) {
        console.error(
          "Camera prediction failed:",
          error
        );

        setPredicting(false);
      }
    };

  const speakResult = () => {
    if (!treatment) {
      return;
    }

    const chemicalText =
      result?.isUncertain
        ? text.uncertainChemical
        : treatment.chemical;

    const speechText =
      `${text.speechDisease}: ${treatment.name}. ` +
      `${text.speechSymptoms}: ${treatment.symptoms}. ` +
      `${text.speechChemical}: ${chemicalText}. ` +
      `${text.speechOrganic}: ${treatment.organic}. ` +
      `${text.speechPrevention}: ${treatment.prevention}.`;

    const speakWithBrowser = () => {
      if (
        typeof window ===
          "undefined" ||
        !window.speechSynthesis
      ) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(
          speechText
        );

      utterance.lang =
        language === "si"
          ? "si-LK"
          : "en-US";

      window.speechSynthesis.speak(
        utterance
      );
    };

    if (
      typeof window !==
        "undefined" &&
      navigator.onLine
    ) {
      const ttsUrl =
        `/api/tts?text=${encodeURIComponent(
          speechText
        )}&lang=${language}`;

      const audio =
        new Audio(ttsUrl);

      audio.addEventListener(
        "error",
        speakWithBrowser
      );

      audio
        .play()
        .catch(speakWithBrowser);
    } else {
      speakWithBrowser();
    }
  };

  const handleReset = () => {
    try {
      sessionStorage.removeItem(
        "govi_nena_scan_active_result"
      );
    } catch (error) {
      console.error(
        "Could not clear active scan state:",
        error
      );
    }

    setStep("camera");
    setResult(null);
    setTreatment(null);
    setCapturedImage(null);
    setCameraError("");
    setNavigationError("");
    coordsRef.current = null;

    loadModel(selectedCrop).then(
      (loaded) => {
        if (loaded) {
          startCamera();
        }
      }
    );
  };

  const handleClose = () => {
    try {
      sessionStorage.removeItem(
        "govi_nena_scan_active_result"
      );
    } catch (error) {
      console.error(
        "Could not clear active scan state:",
        error
      );
    }

    stopCamera();
    router.push("/home");
  };

  const restoreStoredCoordinates = () => {
    if (
      Array.isArray(
        coordsRef.current
      ) &&
      coordsRef.current.length === 2
    ) {
      return coordsRef.current;
    }

    try {
      const storedCoordinates =
        localStorage.getItem(
          getUserStorageKey("govi_nena_last_scan_coords")
        );

      if (!storedCoordinates) {
        return null;
      }

      const parsedCoordinates =
        JSON.parse(storedCoordinates);

      if (
        Array.isArray(
          parsedCoordinates
        ) &&
        parsedCoordinates.length === 2
      ) {
        coordsRef.current =
          parsedCoordinates;

        return parsedCoordinates;
      }
    } catch (error) {
      console.error(
        "Could not restore scan coordinates:",
        error
      );
    }

    return null;
  };

  const handleViewDetails = () => {
    if (!result || !treatment) {
      return;
    }

    if (capturedImage) {
      try {
        localStorage.setItem(
          getUserStorageKey("govi_nena_last_scan_image"),
          capturedImage
        );
      } catch (error) {
        console.error(
          "Could not save captured image:",
          error
        );
      }
    }

    const coordinates =
      restoreStoredCoordinates();

    const params =
      new URLSearchParams({
        disease: result.disease,
        label: treatment.name,
        confidence: String(
          result.confidence
        ),
        crop: selectedCrop,
        isUncertain: String(
          Boolean(
            result.isUncertain
          )
        ),

        ...(coordinates
          ? {
              lat: String(
                coordinates[1]
              ),

              lng: String(
                coordinates[0]
              ),
            }
          : {}),
      });

    router.push(
      `/scan/result-detail?${params.toString()}`
    );
  };

  const handleViewHeatmap = () => {
    setNavigationError("");

    if (
      !result ||
      !result.disease
    ) {
      return;
    }

    const coordinates =
      restoreStoredCoordinates();

    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      setNavigationError(
        text.locationError
      );

      return;
    }

    const [
      longitude,
      latitude,
    ] = coordinates;

    if (
      !Number.isFinite(
        Number(longitude)
      ) ||
      !Number.isFinite(
        Number(latitude)
      )
    ) {
      setNavigationError(
        text.locationError
      );

      return;
    }

    try {
      localStorage.setItem(
        getUserStorageKey("govi_nena_last_scan_crop"),
        selectedCrop
      );

      localStorage.setItem(
        getUserStorageKey("govi_nena_last_result"),
        JSON.stringify(result)
      );

      localStorage.setItem(
        getUserStorageKey("govi_nena_last_scan_coords"),
        JSON.stringify(coordinates)
      );
    } catch (error) {
      console.error(
        "Could not save heatmap parameters:",
        error
      );
    }

    const params =
      new URLSearchParams({
        disease: result.disease,
        crop: selectedCrop,
        lat: String(latitude),
        lng: String(longitude),
        radius: "5",
      });

    router.push(
      `/heatmap?${params.toString()}`
    );
  };

  useEffect(() => {
    if (
      !result ||
      !selectedCrop
    ) {
      return;
    }

    if (
      result.disease === "unknown"
    ) {
      setTreatment(
        createUnknownTreatment()
      );

      return;
    }

    getTreatmentOffline(
      selectedCrop,
      result.disease,
      language
    )
      .then(setTreatment)
      .catch((error) => {
        console.error(
          "Could not change treatment language:",
          error
        );
      });
  }, [
    language,
    result,
    selectedCrop,
  ]);

  useEffect(() => {
    if (
      !cropFromUrl ||
      !CROPS[cropFromUrl]
    ) {
      router.push("/home");
      return;
    }

    let componentActive = true;

    const restoreActiveResult =
      async () => {
        const activeResultFlag =
          sessionStorage.getItem(
            "govi_nena_scan_active_result"
          );

        if (
          activeResultFlag !==
          "true"
        ) {
          return false;
        }

        const storedImage =
          localStorage.getItem(
            getUserStorageKey("govi_nena_last_scan_image")
          );

        const storedResult =
          localStorage.getItem(
            getUserStorageKey("govi_nena_last_result")
          );

        const storedCoordinates =
          localStorage.getItem(
            getUserStorageKey("govi_nena_last_scan_coords")
          );

        if (
          !storedImage ||
          !storedResult
        ) {
          return false;
        }

        try {
          const parsedResult =
            JSON.parse(storedResult);

          if (storedCoordinates) {
            const parsedCoordinates =
              JSON.parse(
                storedCoordinates
              );

            if (
              Array.isArray(
                parsedCoordinates
              ) &&
              parsedCoordinates.length ===
                2
            ) {
              coordsRef.current =
                parsedCoordinates;
            }
          }

          if (!componentActive) {
            return true;
          }

          setCapturedImage(
            storedImage
          );

          setResult(parsedResult);

          if (
            parsedResult.disease ===
            "unknown"
          ) {
            setTreatment(
              createUnknownTreatment()
            );
          } else {
            const treatmentData =
              await getTreatmentOffline(
                cropFromUrl,
                parsedResult.disease,
                language
              );

            if (componentActive) {
              setTreatment(
                treatmentData
              );
            }
          }

          if (componentActive) {
            setStep("result");
          }

          return true;
        } catch (error) {
          console.error(
            "Could not restore scan result:",
            error
          );

          return false;
        }
      };

    restoreActiveResult().then(
      (restored) => {
        if (
          restored ||
          !componentActive
        ) {
          return;
        }

        loadModel(cropFromUrl).then(
          (loaded) => {
            if (
              loaded &&
              componentActive
            ) {
              startCamera();
            }
          }
        );
      }
    );

    return () => {
      componentActive = false;
      stopCamera();
    };
  }, [
    cropFromUrl,
    router,
    loadModel,
  ]);

  if (step === "camera") {
    return (
      <main className="flex min-h-screen flex-col bg-black font-sans">
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Camera header */}
        <header className="flex items-start justify-between gap-3 px-4 pb-4 pt-8 sm:px-6 sm:pt-10">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close camera"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X
              size={22}
              strokeWidth={2.2}
            />
          </button>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-[#1B5E20]/90 px-4 py-2 text-sm font-semibold text-white">
              <CropIcon
                size={19}
                strokeWidth={2.2}
              />

              <span>
                {
                  selectedCropData[
                    language
                  ]
                }
              </span>
            </div>

            <div className="flex max-w-full items-center gap-1.5 rounded-xl bg-yellow-400/15 px-3 py-1.5 text-center text-[11px] text-[#FDD835]">
              <AlertTriangle
                size={14}
                className="shrink-0"
              />

              <span>
                {language === "si"
                  ? `${selectedCropData.si} ${text.onlyScanLeaves}`
                  : `${text.onlyScanLeaves}: ${selectedCropData.en}`}
              </span>
            </div>
          </div>

          <LanguageToggle
            language={language}
            onToggle={
              toggleLanguage
            }
            label={
              text.changeLanguage
            }
          />
        </header>

        {modelLoading && (
          <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <LoaderCircle
              size={58}
              strokeWidth={3}
              className="animate-spin text-[#4CAF50]"
            />

            <p className="text-lg font-semibold text-white">
              {text.loadingModel}
            </p>

            <p className="text-sm text-white/50">
              {
                text.loadingModelSub
              }
            </p>
          </section>
        )}

        {modelError && (
          <section className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <AlertTriangle
              size={52}
              className="text-red-400"
            />

            <p className="max-w-md text-base font-medium text-red-400">
              {modelError}
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <RefreshCw
                size={18}
              />

              {text.tryAgain}
            </button>
          </section>
        )}

        {!modelLoading &&
          !modelError && (
            <>
              <section className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
                <p className="text-center text-sm text-white/70">
                  {text.placeLeaf}
                </p>

                <div className="relative aspect-square w-[min(78vw,60vh,500px)]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full rounded-[20px] object-cover"
                  />

                  <span className="absolute left-0 top-0 h-9 w-9 rounded-tl-md border-l-4 border-t-4 border-[#4CAF50]" />

                  <span className="absolute right-0 top-0 h-9 w-9 rounded-tr-md border-r-4 border-t-4 border-[#4CAF50]" />

                  <span className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-md border-b-4 border-l-4 border-[#4CAF50]" />

                  <span className="absolute bottom-0 right-0 h-9 w-9 rounded-br-md border-b-4 border-r-4 border-[#4CAF50]" />
                </div>

                {cameraError ? (
                  <p className="max-w-md text-center text-sm text-yellow-300">
                    {cameraError}
                  </p>
                ) : (
                  <p className="text-center text-xs text-white/40">
                    {text.goodLight}
                  </p>
                )}
              </section>

              {/* Camera controls */}
              <section className="flex items-center justify-center gap-8 px-6 pb-10 pt-5">
                <label
                  title={
                    text.uploadImage
                  }
                  className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 focus-within:ring-2 focus-within:ring-white"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageUpload
                    }
                    className="hidden"
                  />

                  <ImagePlus
                    size={25}
                    strokeWidth={2}
                  />
                </label>

                <button
                  type="button"
                  onClick={
                    captureAndPredict
                  }
                  disabled={
                    predicting ||
                    !model
                  }
                  aria-label={
                    text.captureImage
                  }
                  title={
                    text.captureImage
                  }
                  className="flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white/35 bg-white transition-colors disabled:cursor-not-allowed disabled:bg-[#A5D6A7]"
                >
                  {predicting ? (
                    <LoaderCircle
                      size={34}
                      className="animate-spin text-[#1B5E20]"
                    />
                  ) : (
                    <span className="flex h-[78%] w-[78%] items-center justify-center rounded-full bg-[#4CAF50]">
                      <Camera
                        size={28}
                        className="text-white"
                      />
                    </span>
                  )}
                </button>

                <div className="h-14 w-14" />
              </section>
            </>
          )}
      </main>
    );
  }

  if (
    step === "result" &&
    treatment &&
    result
  ) {
    const treatmentSections = [
      {
        label:
          text.chemicalTreatment,

        value: result.isUncertain
          ? text.uncertainChemical
          : treatment.chemical,

        headingClassName:
          "text-blue-700",
      },

      {
        label:
          text.organicTreatment,

        value:
          treatment.organic,

        headingClassName:
          "text-[#2E7D32]",
      },

      {
        label:
          text.prevention,

        value:
          treatment.prevention,

        headingClassName:
          "text-[#E65100]",
      },
    ];

    return (
      <main className="min-h-screen bg-[#F9FBF7] font-sans">
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Result header */}
        <header className="sticky top-0 z-20 rounded-b-3xl bg-[#1B5E20] px-4 pb-5 pt-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:px-6">
          <div className="mx-auto flex w-full max-w-[800px] items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              aria-label={
                text.scanAgain
              }
              title={text.scanAgain}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ArrowLeft
                size={21}
                strokeWidth={2.4}
              />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-white">
                {
                  text.analysisResults
                }
              </h1>

              <p className="mt-0.5 truncate text-xs font-medium text-white/75">
                {
                  text.analysisResultsSub
                }
              </p>
            </div>

            <LanguageToggle
              language={language}
              onToggle={
                toggleLanguage
              }
              label={
                text.changeLanguage
              }
            />

            <button
              type="button"
              onClick={speakResult}
              aria-label="Read result aloud"
              title="Read result aloud"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FDD835] text-[#1B5E20] shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Speaker
                size={23}
                strokeWidth={2.2}
              />
            </button>
          </div>
        </header>

        <section className="mx-auto flex w-full max-w-[800px] flex-col gap-5 px-4 py-6 pb-12 sm:px-6">
          {result.isUncertain && (
            <article className="flex items-start gap-4 rounded-[20px] border-2 border-[#FBC02D] bg-[#FFFDE7] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF9C4] text-[#F57F17]">
                <AlertTriangle
                  size={25}
                />
              </div>

              <div>
                <h2 className="font-bold text-[#F57F17]">
                  {
                    text.uncertainTitle
                  }
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#5D4037]">
                  {
                    text.uncertainDescription
                  }
                </p>
              </div>
            </article>
          )}

          {navigationError && (
            <article
              role="alert"
              className="flex items-start gap-3 rounded-[20px] border-2 border-red-300 bg-red-50 p-4 text-red-700"
            >
              <AlertTriangle
                size={21}
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm font-medium leading-6">
                {navigationError}
              </p>
            </article>
          )}

          {capturedImage && (
            <article className="rounded-[20px] border border-[#E0E0E0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <h2 className="mb-3 font-semibold text-[#1B5E20]">
                {
                  text.capturedImage
                }
              </h2>

              <div className="relative flex max-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[#F4F6F0] shadow-inner">
                <img
                  src={capturedImage}
                  alt={
                    text.capturedImage
                  }
                  className="max-h-[320px] max-w-full object-contain"
                />

                <span className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white">
                  {
                    result.confidence
                  }
                  % {text.match}
                </span>
              </div>
            </article>
          )}

          {/* Disease summary */}
          <article className="rounded-[20px] border border-[#E0E0E0] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl font-bold text-[#1B5E20] sm:text-3xl">
              {result.siName}
            </h2>

            <p className="mt-1 text-lg font-semibold text-[#795548]">
              {result.enName}
            </p>

            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="font-medium text-[#888888]">
                {text.confidence}
              </span>

              <span className="font-bold text-gray-800">
                {
                  result.confidence
                }
                %
              </span>
            </div>

            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E8E8E8]">
              <div
                className="h-full rounded-full bg-[#4CAF50] transition-all duration-700"
                style={{
                  width: `${Math.min(
                    Number(
                      result.confidence
                    ),
                    100
                  )}%`,
                }}
              />
            </div>
          </article>

          {/* Description */}
          <article className="rounded-[20px] border border-[#E0E0E0] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="font-semibold text-[#1B5E20]">
              {text.description}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#555555] sm:text-base">
              {
                treatment.symptoms
              }
            </p>
          </article>

          {/* Treatment steps */}
          <article className="rounded-[20px] border border-[#E0E0E0] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="mb-5 font-semibold text-[#1B5E20]">
              {
                text.treatmentSteps
              }
            </h2>

            <div className="flex flex-col">
              {treatmentSections.map(
                (
                  section,
                  index
                ) => (
                  <div
                    key={
                      section.label
                    }
                    className={`flex items-start gap-4 ${
                      index <
                      treatmentSections.length -
                        1
                        ? "mb-4 border-b border-[#F0F0F0] pb-4"
                        : ""
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4CAF50] text-sm font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-sm font-semibold ${section.headingClassName}`}
                      >
                        {
                          section.label
                        }
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#555555]">
                        {
                          section.value
                        }
                      </p>
                    </div>

                    <CheckCircle2
                      size={20}
                      className="mt-1 shrink-0 text-[#E0E0E0]"
                    />
                  </div>
                )
              )}
            </div>
          </article>

          {/* View details */}
          <button
            type="button"
            onClick={
              handleViewDetails
            }
            className="flex w-full items-center justify-between rounded-[20px] border-[2.5px] border-[#4CAF50] bg-white px-5 py-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#4CAF50]">
                <CircleHelp
                  size={21}
                />
              </div>

              <div>
                <p className="font-bold text-[#1B5E20]">
                  {text.viewDetails}
                </p>

                <p className="mt-0.5 text-xs font-medium text-[#888888]">
                  {
                    text.viewDetailsSub
                  }
                </p>
              </div>
            </div>

            <ChevronRight
              size={24}
              className="shrink-0 text-[#4CAF50]"
            />
          </button>

          {/* Local outbreak map */}
          <button
            type="button"
            onClick={
              handleViewHeatmap
            }
            disabled={
              result.disease ===
              "unknown"
            }
            className="flex w-full items-center justify-between rounded-[20px] bg-gradient-to-r from-[#1B5E20] to-[#4CAF50] px-5 py-4 text-left text-white shadow-[0_4px_16px_rgba(46,125,50,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <MapPinned
                  size={21}
                />
              </div>

              <div>
                <p className="font-bold">
                  {
                    text.outbreakMap
                  }
                </p>

                <p className="mt-0.5 text-xs font-medium text-white/70">
                  {
                    text.outbreakMapSub
                  }
                </p>
              </div>
            </div>

            <ChevronRight
              size={24}
              className="shrink-0"
            />
          </button>

          {/* Scan again */}
          <button
            type="button"
            onClick={handleReset}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-[#2E7D32] bg-transparent px-5 py-4 font-semibold text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
          >
            <RefreshCw
              size={19}
            />

            {text.scanAgain}
          </button>
        </section>
      </main>
    );
  }

  return null;
}

function ScanLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FBF7]">
      <LoaderCircle
        size={56}
        strokeWidth={3}
        className="animate-spin text-[#4CAF50]"
        aria-label="Loading"
      />
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <ScanLoadingFallback />
      }
    >
      <ScanContent />
    </Suspense>
  );
}