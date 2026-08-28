"use client";

import { Suspense, useEffect, useMemo, useState, } from "react";
import { AlertTriangle, ArrowLeft, CalendarDays, LoaderCircle, MapPin, MapPinned, Navigation, Radius, RefreshCw, } from "lucide-react";
import { GiChiliPepper, GiTomato, GiWheat, } from "react-icons/gi";
import { useRouter, useSearchParams, } from "next/navigation";
import { getCachedGPSCoords, getDistrictCoords, DISTRICT_CENTROIDS, getUserStorageKey } from "@/lib/location";

const heatmapText = {
  si: {
    pageTitle: "ව්‍යාප්ති සිතියම",
    pageTitleSub: "Outbreak Heatmap",
    changeLanguage: "භාෂාව වෙනස් කරන්න",
    goBack: "ආපසු යන්න",
    nearbyOutbreaks: "ආසන්න රෝග වාර්තා",
    mapTitle: "රෝග ව්‍යාප්ති ස්ථාන",
    recentReports: "මෑතකාලීන වාර්තා",
    selectedDisease: "තෝරාගත් රෝගය",
    selectedCrop: "තෝරාගත් බෝගය",
    searchRadius: "සෙවීමේ අරය",
    scanLocation: "ස්කෑන් කළ ස්ථානය",
    withinRadius: "කිලෝමීටර් 5 ඇතුළත",
    radiusUnit: "කි.මී.",
    paddy: "වී",
    tomato: "තක්කාලි",
    chili: "මිරිස්",
    confidence: "ගැළපීම",
    reports: "වාර්තා",
    report: "වාර්තාව",
    loading: "ආසන්න වාර්තා සොයමින්...",
    locationLoading: "ස්ථානය සොයමින්...",
    noOutbreaks: "මෙම රෝගයට අදාළ වාර්තා කිලෝමීටර් 5 ඇතුළත හමු නොවීය.",
    noLocation: "ස්කෑන් කළ ස්ථානය සොයාගත නොහැක.",
    noDisease: "ස්කෑන් කළ රෝග තොරතුරු සොයාගත නොහැක.",
    requestFailed: "රෝග වාර්තා ලබාගත නොහැකි විය.",
    retry: "නැවත උත්සාහ කරන්න",
    localOnly: "මෙහි පෙන්වන්නේ තෝරාගත් රෝගයට අදාළ කිලෝමීටර් 5 ඇතුළත වාර්තා පමණි.",
    currentScan: "වත්මන් ස්කෑන් ස්ථානය",
  },

  en: {
    pageTitle: "Outbreak Heatmap",
    pageTitleSub: "ව්‍යාප්ති සිතියම",
    changeLanguage: "Change language",
    goBack: "Go back",
    nearbyOutbreaks: "Nearby Outbreaks",
    mapTitle: "Outbreak Locations",
    recentReports: "Recent Reports",
    selectedDisease: "Selected Disease",
    selectedCrop: "Selected Crop",
    searchRadius: "Search Radius",
    scanLocation: "Scan Location",
    withinRadius: "Within 5 kilometres",
    radiusUnit: "km",
    paddy: "Paddy",
    tomato: "Tomato",
    chili: "Chilli",
    confidence: "match",
    reports: "reports",
    report: "report",
    loading: "Searching nearby reports...",
    locationLoading: "Finding location...",
    noOutbreaks: "No reports of this disease were found within 5 kilometres.",
    noLocation: "The scanned location could not be found.",
    noDisease: "The scanned disease information could not be found.",
    requestFailed: "Unable to retrieve outbreak reports.",
    retry: "Try Again",
    localOnly: "Only reports of the selected disease within 5 kilometres are shown.",
    currentScan: "Current scan location",
  },
};

const cropInformation = {
  paddy: {
    Icon: GiWheat,
    colorClassName: "text-[#1B5E20]",
    backgroundClassName: "bg-[#E8F5E9]",
  },

  tomato: {
    Icon: GiTomato,
    colorClassName: "text-[#B71C1C]",
    backgroundClassName: "bg-[#FFEBEE]",
  },

  chili: {
    Icon: GiChiliPepper,
    colorClassName: "text-[#E65100]",
    backgroundClassName: "bg-[#FFF3E0]",
  },
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
      className={`relative h-8 w-[72px] shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white ${language === "si"
        ? "bg-[#4CAF50]"
        : "bg-[#888888]"
        }`}
    >
      <span
        className={`absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] transition-all duration-300 ${language === "si"
          ? "left-[3px]"
          : "left-[43px]"
          }`}
      />

      <span
        className={`absolute top-[7px] select-none text-[10px] font-bold text-white transition-all duration-300 ${language === "si"
          ? "left-[33px]"
          : "left-[8px]"
          }`}
      >
        {language === "si" ? "සිං" : "EN"}
      </span>
    </button>
  );
}

function formatDiseaseName(disease) {
  if (!disease) {
    return "";
  }

  return disease
    .replaceAll("___", " - ")
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatCoordinate(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue.toFixed(4)
    : "-";
}

function HeatmapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState("si");
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queryDetails, setQueryDetails] = useState(null);
  const [scanLocationName, setScanLocationName,] = useState("");
  const [locationLoading, setLocationLoading,] = useState(false);
  const text = heatmapText[language];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  const getHeatmapParameters = () => {
    let disease = searchParams.get("disease");
    let crop = searchParams.get("crop");
    let latitude = searchParams.get("lat");
    let longitude = searchParams.get("lng");

    const radius = searchParams.get("radius") || "5";

    try {
      if (!disease) {
        const storedResult =
          localStorage.getItem(
            getUserStorageKey("govi_nena_last_result")
          );

        if (storedResult) {
          const parsedResult =
            JSON.parse(storedResult);

          disease =
            parsedResult.disease || "";
        }
      }

      if (!crop) {
        crop =
          localStorage.getItem(
            getUserStorageKey("govi_nena_last_scan_crop")
          ) || "";
      }

      if (!latitude || !longitude) {
        // 1. Try the last completed scan coordinates (user-specific key)
        const storedCoordinates = localStorage.getItem(
          getUserStorageKey("govi_nena_last_scan_coords")
        );
        if (storedCoordinates) {
          const parsedCoordinates = JSON.parse(storedCoordinates);
          if (Array.isArray(parsedCoordinates) && parsedCoordinates.length === 2) {
            longitude = String(parsedCoordinates[0]);
            latitude = String(parsedCoordinates[1]);
          }
        }

        // 2. Try the home-page/shared GPS cache if last scan coords are missing
        if (!latitude || !longitude) {
          const cached = getCachedGPSCoords();
          if (cached) {
            longitude = String(cached[0]);
            latitude = String(cached[1]);
          }
        }

        // 3. Fall back to user's registered district centroid
        if (!latitude || !longitude) {
          try {
            const storedUser = JSON.parse(localStorage.getItem("govi_nena_user") || "{}");
            const district = storedUser.district || "Matale";
            const districtCoords = getDistrictCoords(district);
            longitude = String(districtCoords[0]);
            latitude = String(districtCoords[1]);
          } catch {
            const districtCoords = getDistrictCoords("Matale");
            longitude = String(districtCoords[0]);
            latitude = String(districtCoords[1]);
          }
        }
      }

      // 4. Default fallbacks if user has never scanned anything before
      if (!crop) {
        crop = "paddy";
      }
      if (!disease) {
        disease = "blast";
      }
    } catch (error) {
      console.error(
        "Could not restore the latest scan:",
        error
      );

      if (!crop) crop = "paddy";
      if (!disease) disease = "blast";
    }

    return {disease,crop, latitude,longitude,radius,};
  };

  const fetchScanLocationName = async (latitude,longitude) => {
    if (!latitude || !longitude) {
      setScanLocationName("");
      return;
    }

    const numLat = Number(latitude);
    const numLng = Number(longitude);
    const matchedDistrict = Object.keys(DISTRICT_CENTROIDS).find((key) => {
      const coords = DISTRICT_CENTROIDS[key];
      return Math.abs(coords[0] - numLng) < 0.0001 && Math.abs(coords[1] - numLat) < 0.0001;
    });

    if (matchedDistrict) {
   
      setScanLocationName(matchedDistrict);
      return;
    }

    setLocationLoading(true);

    try {
      const response = await fetch(
        `${apiUrl}/api/weather?lat=${encodeURIComponent(
          latitude
        )}&lng=${encodeURIComponent(
          longitude
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Unable to retrieve the scan location."
        );
      }

      setScanLocationName(
        data.locationName || ""
      );
    } catch (error) {
      console.error(
        "Could not retrieve scan location name:",
        error
      );

      setScanLocationName("");
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchOutbreaks = async () => {setLoading(true); setError(""); setScanLocationName("");
  const parameters = getHeatmapParameters();
  const { disease, crop, latitude, longitude, radius, } = parameters;

    setQueryDetails(parameters);

    if (!disease) {
      setError(text.noDisease);
      setLoading(false);
      return;
    }

    if (!latitude || !longitude) {
      setError(text.noLocation);
      setLoading(false);
      return;
    }

    fetchScanLocationName(
      latitude,
      longitude
    );

    try {
      const query =
        new URLSearchParams({
          lat: latitude,
          lng: longitude,
          radius,
          disease,
        });

      if (crop) {
        query.set("crop", crop);
      }

      const response = await fetch(
        `${apiUrl}/api/outbreaks?${query.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          text.requestFailed
        );
      }

      setOutbreaks(
        Array.isArray(data.outbreaks)
          ? data.outbreaks
          : []
      );

      setQueryDetails((current) => ({
        ...current,
        ...(data.filters || {}),
      }));
    } catch (error) {
      console.error(
        "Failed to fetch outbreaks:",
        error
      );

      setOutbreaks([]);

      setError(
        error.message ||
        text.requestFailed
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem(
        "govi_nena_token"
      );

    if (!token) {
      router.replace("/login");
      return;
    }

    fetchOutbreaks();
  }, [searchParams, router]);

  const currentCrop = queryDetails?.crop || "";
  const selectedCropInfo = cropInformation[currentCrop] || cropInformation.paddy;
  const CropIcon = selectedCropInfo.Icon;
  const diseaseDisplayName = formatDiseaseName(queryDetails?.disease);

  const plottedOutbreaks = useMemo(
    () =>
      outbreaks.map((outbreak) => {
        const coordinates = outbreak.location?.coordinates || [];
        const longitude = Number(coordinates[0]);
        const latitude = Number(coordinates[1]);
        const centreLongitude = Number(queryDetails?.longitude);
        const centreLatitude = Number(queryDetails?.latitude);
        const longitudeDifference = longitude - centreLongitude;
        const latitudeDifference = latitude - centreLatitude;
        
        let xPercent = Math.max(
          8,
          Math.min(
            92,
            50 +
            (longitudeDifference /
              0.09) *
            45
          )
        );

        let yPercent = Math.max(
          8,
          Math.min(
            92,
            50 -
            (latitudeDifference /
              0.09) *
            45
          )
        );

        const isAtCenter =
          Math.abs(latitude - centreLatitude) < 0.0001 &&
          Math.abs(longitude - centreLongitude) < 0.0001;
        if (isAtCenter) {
          xPercent += 5;
          yPercent += 5;
        }

        return {
          ...outbreak,
          xPercent,
          yPercent,
        };
      }),
    [outbreaks, queryDetails]
  );

  const isCurrentGPS = useMemo(() => {
    const cached = getCachedGPSCoords();
    if (!cached || !queryDetails?.latitude || !queryDetails?.longitude) return false;
    const numLat = Number(queryDetails.latitude);
    const numLng = Number(queryDetails.longitude);
    return Math.abs(cached[0] - numLng) < 0.0005 && Math.abs(cached[1] - numLat) < 0.0005;
  }, [queryDetails]);

  const displayedLocation =
    scanLocationName ||
    (isCurrentGPS
      ? (language === "si" ? "වත්මන් ස්ථානය" : "Current Location")
      : `${formatCoordinate(queryDetails?.latitude)}, ${formatCoordinate(queryDetails?.longitude)}`);

  return (
    <main className="min-h-screen bg-[#F9FBF7] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 rounded-b-3xl bg-[#1B5E20] px-4 pb-5 pt-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:px-6">
        <div className="mx-auto flex w-full max-w-[800px] items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={text.goBack}
            title={text.goBack}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <ArrowLeft
              size={21}
              strokeWidth={2.5}
            />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-white sm:text-2xl">
              {text.pageTitle}
            </h1>

            <p className="mt-0.5 truncate text-xs font-medium text-white/75">
              {text.pageTitleSub}
            </p>
          </div>

          <LanguageToggle
            language={language}
            onToggle={toggleLanguage}
            label={text.changeLanguage}
          />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[800px] flex-col gap-5 px-4 py-6 pb-12 sm:px-6">
        {/* Search information */}
        {queryDetails && (
          <article className="rounded-[20px] border border-[#E0E0E0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${selectedCropInfo.backgroundClassName}`}
              >
                <CropIcon
                  size={26}
                  strokeWidth={2.2}
                  className={
                    selectedCropInfo.colorClassName
                  }
                />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-lg font-bold text-[#1B5E20]">
                  {diseaseDisplayName ||
                    text.selectedDisease}
                </h2>

                <p className="mt-0.5 text-sm text-[#795548]">
                  {text.localOnly}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
              {/* Radius */}
              <div className="rounded-2xl bg-[#F9FBF7] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#795548]">
                  <Radius size={17} />

                  <span className="text-xs font-medium">
                    {text.searchRadius}
                  </span>
                </div>

                <p className="font-bold text-[#1B5E20]">
                  {queryDetails.radiusKm ||
                    queryDetails.radius ||
                    5}{" "}
                  {text.radiusUnit}
                </p>
              </div>

              {/* Scan location */}
              <div className="rounded-2xl bg-[#F9FBF7] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#795548]">
                  <Navigation size={17} />

                  <span className="text-xs font-medium">
                    {text.scanLocation}
                  </span>
                </div>

                {locationLoading ? (
                  <div className="flex items-center gap-2 text-[#1B5E20]">
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />

                    <p className="text-sm font-bold">
                      {text.locationLoading}
                    </p>
                  </div>
                ) : (
                  <p className="break-words text-sm font-bold text-[#1B5E20]">
                    {displayedLocation}
                  </p>
                )}
              </div>
            </div>
          </article>
        )}

        {/* Error */}
        {error && (
          <article className="flex items-start gap-3 rounded-[20px] border-2 border-red-300 bg-red-50 p-5 text-red-700">
            <AlertTriangle
              size={23}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchOutbreaks}
                className="mt-3 flex items-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2E7D32]"
              >
                <RefreshCw size={16} />
                {text.retry}
              </button>
            </div>
          </article>
        )}

        {/* Local map */}
        <article className="rounded-[20px] border border-[#E0E0E0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
          <div className="mb-4 flex items-center gap-2 text-[#1B5E20]">
            <MapPinned
              size={21}
              strokeWidth={2.2}
            />

            <h2 className="font-bold">
              {text.mapTitle}
            </h2>
          </div>

          <div className="relative h-[280px] overflow-hidden rounded-2xl border border-[#C8E6C9] bg-[#E8F5E9]">
            <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#81C784]/50 bg-white/20" />

            <div className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#66BB6A]/60" />

            <div className="absolute left-1/2 top-1/2 h-[75px] w-[75px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4CAF50]/70" />

            {/* Current scan location */}
            <div
              className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
              title={
                scanLocationName ||
                text.currentScan
              }
            >
              <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-[#1B5E20]/25" />

              <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#1B5E20] text-white shadow-lg">
                <Navigation
                  size={17}
                  fill="currentColor"
                />
              </div>
            </div>

            {/* Nearby outbreak reports */}
            {plottedOutbreaks.map(
              (outbreak) => (
                <div
                  key={outbreak._id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${outbreak.xPercent}%`,
                    top: `${outbreak.yPercent}%`,
                  }}
                  title={`${formatDiseaseName(
                    outbreak.disease
                  )} - ${outbreak.confidence
                    }%`}
                >
                  <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-red-500/30" />

                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-md">
                    <MapPin
                      size={17}
                      fill="currentColor"
                    />
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#E8F5E9]/85">
                <LoaderCircle
                  size={42}
                  className="animate-spin text-[#4CAF50]"
                />

                <p className="text-sm font-medium text-[#1B5E20]">
                  {text.loading}
                </p>
              </div>
            )}

            {!loading &&
              !error &&
              outbreaks.length === 0 && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center">
                  <MapPinned
                    size={42}
                    className="mb-3 text-[#81C784]"
                  />

                  <p className="text-sm font-semibold leading-6 text-[#558B2F]">
                    {text.noOutbreaks}
                  </p>
                </div>
              )}

            <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#1B5E20] shadow-sm">
              {text.withinRadius}
            </div>
          </div>
        </article>

        {/* Reports heading */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#1B5E20]">
            {text.recentReports}
          </h2>

          <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-bold text-[#2E7D32]">
            {outbreaks.length}{" "}
            {outbreaks.length === 1
              ? text.report
              : text.reports}
          </span>
        </div>

        {/* Report cards */}
        {!loading &&
          outbreaks.map((outbreak) => {
            const outbreakCropInfo =
              cropInformation[
              outbreak.crop
              ] ||
              cropInformation.paddy;

            const OutbreakCropIcon =
              outbreakCropInfo.Icon;

            return (
              <article
                key={outbreak._id}
                className="flex items-center gap-4 rounded-2xl border border-[#E0E0E0] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${outbreakCropInfo.backgroundClassName}`}
                >
                  <OutbreakCropIcon
                    size={24}
                    strokeWidth={2.2}
                    className={
                      outbreakCropInfo.colorClassName
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-bold text-[#1B5E20] sm:text-base">
                    {formatDiseaseName(
                      outbreak.disease
                    )}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#795548]">
                    <MapPin
                      size={13}
                      className="shrink-0"
                    />

                    <span className="truncate">
                      {outbreak.locationName ||
                        `${formatCoordinate(
                          outbreak.location
                            ?.coordinates?.[1]
                        )}, ${formatCoordinate(
                          outbreak.location
                            ?.coordinates?.[0]
                        )}`}
                    </span>
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-[#E8F5E9] px-2.5 py-1 text-[11px] font-bold text-[#2E7D32]">
                    {outbreak.confidence}%{" "}
                    {text.confidence}
                  </span>

                  <p className="mt-2 flex items-center justify-end gap-1 text-[10px] font-medium text-[#AAAAAA]">
                    <CalendarDays size={11} />

                    {new Date(
                      outbreak.timestamp
                    ).toLocaleDateString(
                      language === "si"
                        ? "si-LK"
                        : "en-LK"
                    )}
                  </p>
                </div>
              </article>
            );
          })}
      </section>
    </main>
  );
}

function HeatmapLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FBF7]">
      <LoaderCircle
        size={54}
        strokeWidth={3}
        className="animate-spin text-[#4CAF50]"
        aria-label="Loading"
      />
    </main>
  );
}

export default function HeatmapPage() {
  return (
    <Suspense
      fallback={
        <HeatmapLoadingFallback />
      }
    >
      <HeatmapContent />
    </Suspense>
  );
}