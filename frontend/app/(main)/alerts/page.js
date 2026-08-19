"use client";

import { useEffect,useState,} from "react";
import {AlertTriangle,ArrowLeft,BellRing,CalendarDays,Leaf,LoaderCircle,MapPin,Navigation,ShieldCheck} from "lucide-react";
import {GiChiliPepper,GiTomato,GiWheat,} from "react-icons/gi";
import { useRouter } from "next/navigation";
import {
  getCachedGPSCoords,
  getGPSPermissionStatus,
  saveGPSCoords,
  setGPSPermissionStatus,
  getDistrictCoords,
  getUserStorageKey,
} from "@/lib/location";

const alertsText = {
  si: {
    pageTitle: "ව්‍යාප්ති ඇඟවීම්",
    pageTitleSub: "Spread Warnings",
    changeLanguage: "භාෂාව වෙනස් කරන්න",
    goBack: "ආපසු යන්න",
    checkingArea: "පරීක්ෂා කරන ප්‍රදේශය",
    withinRadius: "කිලෝමීටර් 10 ඇතුළත",
    locationUnavailable: "ස්ථානය ලබාගත නොහැක",
    findingLocation: "ස්ථානය සොයමින්...",
    loading: "අනතුරු ඇඟවීම් සොයමින්...",
    radius: "අරය",
    kilometreUnit: "කි.මී.",
    noAlertsTitle:"ආසන්නයේ රෝග ව්‍යාප්තියක් නොමැත",
    noAlertsDescription: "ඔබේ ප්‍රදේශය අවට ඉහළ රෝග ව්‍යාප්ති අනතුරු ඇඟවීම් හඳුනාගෙන නොමැත. ඔබේ වගාවන් දැනට ආරක්ෂිතයි.",
    fetchError: "අනතුරු ඇඟවීම් ලබාගත නොහැකි විය.",
    paddy: "වී",
    tomato: "තක්කාලි",
    chili: "මිරිස්",
    gpsLocation: "GPS ස්ථානය",
    districtLocation: "ලියාපදිංචි දිස්ත්‍රික්කය",
  },

  en: {
    pageTitle: "Spread Warnings",
    pageTitleSub: "ව්‍යාප්ති ඇඟවීම්",
    changeLanguage: "Change language",
    goBack: "Go back",
    checkingArea: "Checking area",
    withinRadius: "Within 10 kilometres",
    locationUnavailable: "Location unavailable",
    findingLocation: "Finding location...",
    loading: "Searching for outbreak warnings...",
    radius: "Radius",
    kilometreUnit: "km",
    noAlertsTitle: "No Outbreaks Nearby",
    noAlertsDescription: "No high-spread crop disease warnings have been detected near your area. Your crops are currently safe.",
    fetchError: "Unable to retrieve outbreak warnings.",
    paddy: "Paddy",
    tomato: "Tomato",
    chili: "Chilli",
    gpsLocation: "GPS location",
    districtLocation: "Registered district",
  },
};

// DISTRICT_CENTROIDS is now imported from @/lib/location (shared with home & scan pages).



const cropInformation = {
  paddy: {
    Icon: GiWheat,
    iconClassName: "text-[#2E7D32]",
    backgroundClassName: "bg-[#E8F5E9]",
  },

  tomato: {
    Icon: GiTomato,
    iconClassName: "text-[#D32F2F]",
    backgroundClassName: "bg-[#FFEBEE]",
  },

  chili: {
    Icon: GiChiliPepper,
    iconClassName: "text-[#E65100]",
    backgroundClassName: "bg-[#FFF3E0]",
  },

  default: {
    Icon: Leaf,
    iconClassName: "text-[#2E7D32]",
    backgroundClassName: "bg-[#E8F5E9]",
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

function formatCoordinate(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue.toFixed(4)
    : "-";
}

function formatCropName(
  crop,
  language
) {
  const normalizedCrop =
    crop?.toLowerCase();

  if (
    normalizedCrop === "paddy" ||
    normalizedCrop === "tomato" ||
    normalizedCrop === "chili"
  ) {
    return alertsText[language][
      normalizedCrop
    ];
  }

  return crop || "";
}

export default function AlertsPage() {
  const router = useRouter();
  const [language, setLanguage] =useState("si");
  const [alerts, setAlerts] =useState([]);
  const [loading, setLoading] =useState(true);
  const [error, setError] =useState(false);
  const [userCoords, setUserCoords] =useState(null);
  const [ locationSource,setLocationSource,] = useState("");
  const [locationName,setLocationName, ] = useState("");
  const [locationLoading,setLocationLoading,] = useState(false);
  const text = alertsText[language];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ||"http://localhost:5000";

  /*
   * Restore the previously selected language.
   */
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

  /*
   * Get the user's location and retrieve nearby alerts.
   */
  useEffect(() => {
    const token =
      localStorage.getItem(
        "govi_nena_token"
      );

    const storedUser =
      localStorage.getItem(
        "govi_nena_user"
      );

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    let userObject = null;

    try {
      userObject =
        JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Could not read the stored user:",
        error
      );
    }

    /*
     * Reverse-geocode GPS coordinates using the existing
     * backend weather endpoint.
     *
     * If this request fails, the coordinate values remain
     * available as a fallback.
     */
    const fetchLocationName = async (
      latitude,
      longitude
    ) => {
      setLocationLoading(true);
      setLocationName("");

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
              "Could not retrieve location name."
          );
        }

        setLocationName(
          data.locationName || ""
        );
      } catch (error) {
        console.error(
          "Could not retrieve location name:",
          error
        );

        setLocationName("");
      } finally {
        setLocationLoading(false);
      }
    };

    const fetchAlerts = async (
      latitude,
      longitude
    ) => {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch(
          `${apiUrl}/api/alerts?lat=${encodeURIComponent(
            latitude
          )}&lng=${encodeURIComponent(
            longitude
          )}`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await response
          .json()
          .catch(() => []);

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to retrieve alerts."
          );
        }

        if (Array.isArray(data)) {
          setAlerts(data);
        } else if (
          Array.isArray(data.alerts)
        ) {
          setAlerts(data.alerts);
        } else {
          setAlerts([]);
        }

        try {
          const lastViewedKey = getUserStorageKey("govi_nena_alerts_last_viewed");
          const nowTime = Date.now();
          localStorage.setItem(lastViewedKey, String(nowTime));
          console.log("ALERTS PAGE VIEWED SET:", {
            lastViewedKey,
            nowTime
          });
        } catch (e) {
          // Ignore
        }
      } catch (error) {
        console.error(
          "Failed to fetch alerts:",
          error
        );

        setAlerts([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    /*
     * Fallback: use the centroid of the user's registered district.
     * Called when GPS is denied or skipped.
     */
    const useDistrictLocation = () => {
      const district = userObject?.district || 'Kandy';
      const [longitude, latitude] = getDistrictCoords(district);

      setUserCoords({ lat: latitude, lng: longitude });
      setLocationName(district);
      setLocationSource('district');
      setLocationLoading(false);
      fetchAlerts(latitude, longitude);
    };

    /*
     * ── Location strategy ────────────────────────────────────────────────
     *
     * 1. Use the GPS coordinates already cached by the home-page banner.
     *    This is the common case after the user grants permission once.
     *
     * 2. If no cache exists but the browser permission is still 'prompt'
     *    (user was never asked), attempt getCurrentPosition once. If it
     *    succeeds we save the result so future visits skip this step.
     *
     * 3. If permission is 'denied' or 'skipped', use the registered
     *    district centroid — no hidden [80.601, 7.901] fallback.
     * ───────────────────────────────────────────────────────────────────
     */
    const cachedCoords = getCachedGPSCoords();

    if (cachedCoords) {
      // GPS cache is fresh — use it directly.
      const [longitude, latitude] = cachedCoords;
      setUserCoords({ lat: latitude, lng: longitude });
      setLocationSource('gps');
      fetchLocationName(latitude, longitude);
      fetchAlerts(latitude, longitude);
      return;
    }

    const permStatus = getGPSPermissionStatus();

    if (permStatus === 'granted') {
      // Permission was granted before but the cache expired — refresh silently.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            saveGPSCoords([longitude, latitude]);
            setUserCoords({ lat: latitude, lng: longitude });
            setLocationSource('gps');
            fetchLocationName(latitude, longitude);
            fetchAlerts(latitude, longitude);
          },
          () => useDistrictLocation(),
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
        );
        return;
      }
      useDistrictLocation();
      return;
    }

    if (permStatus === 'prompt' && navigator.geolocation) {
      // Browser hasn't decided yet — try once. If it succeeds, save the result.
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          saveGPSCoords([longitude, latitude]);
          setGPSPermissionStatus('granted');
          setUserCoords({ lat: latitude, lng: longitude });
          setLocationSource('gps');
          fetchLocationName(latitude, longitude);
          fetchAlerts(latitude, longitude);
        },
        () => {
          // Browser silently denied — fall back to district.
          useDistrictLocation();
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
      return;
    }

    // 'denied' or 'skipped' — use registered district.
    useDistrictLocation();
  }, [router, apiUrl]);

  const toggleLanguage = () => {
    const nextLanguage =
      language === "si"
        ? "en"
        : "si";

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

  const displayedLocation =
    locationName ||
    (userCoords
      ? `${formatCoordinate(
          userCoords.lat
        )}, ${formatCoordinate(
          userCoords.lng
        )}`
      : text.locationUnavailable);

  return (
    <main className="flex min-h-screen flex-col bg-[#F9FBF7] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 rounded-b-3xl bg-[#1B5E20] px-4 pb-5 pt-8 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:px-6">
        <div className="mx-auto flex w-full max-w-[800px] items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
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
            onToggle={
              toggleLanguage
            }
            label={
              text.changeLanguage
            }
          />
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto flex w-full max-w-[800px] flex-1 flex-col gap-5 px-4 py-6 pb-12 sm:px-6">
        {/* Location card */}
        {userCoords && (
          <article className="rounded-[20px] border border-[#E0E0E0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5E9] text-[#1B5E20]">
                {locationSource ===
                "gps" ? (
                  <Navigation
                    size={24}
                    strokeWidth={2.2}
                  />
                ) : (
                  <MapPin
                    size={24}
                    strokeWidth={2.2}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#795548]">
                  {locationSource ===
                  "gps"
                    ? text.gpsLocation
                    : text.districtLocation}
                </p>

                {locationLoading ? (
                  <div className="mt-2 flex items-center gap-2 text-[#1B5E20]">
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    <span className="text-sm font-bold">
                      {
                        text.findingLocation
                      }
                    </span>
                  </div>
                ) : (
                  <h2 className="mt-1 break-words text-base font-bold text-[#1B5E20]">
                    {displayedLocation}
                  </h2>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#2E7D32]">
                  <MapPin size={14} />

                  <span>
                    {text.checkingArea}:{" "}
                    {text.withinRadius}
                  </span>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Error */}
        {error && (
          <article
            role="alert"
            className="flex items-start gap-3 rounded-[20px] border border-red-300 bg-red-50 p-4 text-red-700"
          >
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium leading-6">
              {text.fetchError}
            </p>
          </article>
        )}

        {/* Loading */}
        {loading && (
          <section className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <LoaderCircle
              size={52}
              strokeWidth={3}
              className="animate-spin text-[#4CAF50]"
            />

            <p className="text-sm font-medium text-[#1B5E20]">
              {text.loading}
            </p>
          </section>
        )}

        {/* Alert list */}
        {!loading &&
          alerts.length > 0 && (
            <section className="flex flex-col gap-4">
              {alerts.map((alert) => {
                const normalizedCrop =
                  alert.crop?.toLowerCase();

                const cropData =
                  cropInformation[
                    normalizedCrop
                  ] ||
                  cropInformation.default;

                const CropIcon =
                  cropData.Icon;

                return (
                  <article
                    key={alert._id}
                    className="relative overflow-hidden rounded-[20px] border-2 border-[#FBC02D] bg-[#FFFDE7] p-5 pl-6 shadow-[0_4px_16px_rgba(251,192,45,0.15)]"
                  >
                    <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#FBC02D]" />

                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${cropData.backgroundClassName}`}
                      >
                        <CropIcon
                          size={28}
                          className={
                            cropData.iconClassName
                          }
                          aria-label={formatCropName(
                            alert.crop,
                            language
                          )}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <AlertTriangle
                            size={19}
                            className="mt-0.5 shrink-0 text-[#F57F17]"
                          />

                          <h2 className="break-words text-base font-bold text-[#F57F17] sm:text-lg">
                            {alert.title}
                          </h2>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-[#5D4037]">
                          {alert.message}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C4] px-3 py-1.5 text-[11px] font-bold text-[#E65100]">
                              <BellRing
                                size={13}
                              />

                              {text.radius}:{" "}
                              {alert.radiusKm ||
                                5}
                              {
                                text.kilometreUnit
                              }
                            </span>

                            {alert.crop && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 py-1.5 text-[11px] font-bold text-[#2E7D32]">
                                <Leaf
                                  size={13}
                                />

                                {formatCropName(
                                  alert.crop,
                                  language
                                )}
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#888888]">
                            <CalendarDays
                              size={13}
                            />

                            {new Date(
                              alert.createdAt
                            ).toLocaleDateString(
                              language ===
                                "si"
                                ? "si-LK"
                                : "en-LK"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

        {/* No alerts */}
        {!loading &&
          alerts.length === 0 &&
          !error && (
            <section className="flex flex-1 items-center justify-center py-8">
              <article className="w-full rounded-[20px] border border-[#E0E0E0] bg-white px-6 py-12 text-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                  <ShieldCheck
                    size={34}
                    strokeWidth={2.1}
                  />
                </div>

                <h2 className="mt-4 text-lg font-bold text-[#1B5E20]">
                  {
                    text.noAlertsTitle
                  }
                </h2>

                <p className="mx-auto mt-2 max-w-[480px] text-sm leading-6 text-[#795548]">
                  {
                    text.noAlertsDescription
                  }
                </p>
              </article>
            </section>
          )}
      </section>
    </main>
  );
}