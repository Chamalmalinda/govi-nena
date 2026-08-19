"use client";

import {Suspense,useEffect,useState,} from "react";
import {AlertTriangle,ArrowLeft,CalendarDays,CheckCircle2,CloudSun,Droplets,Leaf,LoaderCircle,MapPin,ShieldCheck,Sprout, Thermometer,Wind,} from "lucide-react";
import {useRouter,useSearchParams,} from "next/navigation";
import { getTreatmentOffline } from "@/lib/offlineStorage";
import { getUserStorageKey } from "@/lib/location";

const detailText = {
  si: {
    pageTitle: "රෝග විස්තර",
    pageTitleSub: "Disease Details",
    changeLanguage:
      "භාෂාව වෙනස් කරන්න",
    goBack: "ආපසු යන්න",
    loading:
      "තොරතුරු පූරණය වෙමින්...",
    uncertainTitle:
      "අවිනිශ්චිත ස්කෑන් ප්‍රතිඵලයකි",
    uncertainDescription:
      "මෙම රෝග විනිශ්චය අවිනිශ්චිත මට්ටමක පවතී. නිවැරදි රසායනික ප්‍රතිකාර භාවිතයට පෙර, වඩා හොඳ ආලෝකයකින් පත්‍රය ආසන්නයෙන් නැවත ස්කෑන් කරන්න.",
    capturedImage:
      "ග්‍රහණය කළ රූපය",
    imageAlt:
      "ස්කෑන් කළ ශාක පත්‍රය",
    match: "ගැළපීම",
    confidence: "විශ්වාසය",
    symptoms: "රෝග ලක්ෂණ",
    environmentalFactors:
      "පාරිසරික සාධක",
    warningSigns:
      "අනතුරු ඇඟවීමේ ලක්ෂණ",
    preventionTips:
      "වැළැක්වීමේ උපදෙස්",
    treatmentSteps:
      "ප්‍රතිකාර පියවර",
    temperature: "උෂ්ණත්වය",
    humidity: "ආර්ද්‍රතාව",
    wind: "සුළං වේගය",
    location: "ස්ථානය",
    season: "කාලය",
    favorable: "හිතකර",
    normal: "සාමාන්‍ය",
    gpsActive: "GPS සක්‍රීයයි",
    highHumidity:
      "ඉහළ ආර්ද්‍රතාව",
    moderateHumidity:
      "මධ්‍යස්ථ ආර්ද්‍රතාව",
    lowHumidity:
      "අඩු ආර්ද්‍රතාව",
    yala: "යල",
    yalaPeriod:
      "අප්‍රේල් - සැප්තැම්බර්",
    warning1:
      "කොළ කහ හෝ දුඹුරු පැහැයට හැරීම",
    warning2:
      "කොළ මත කළු ලප හෝ තුවාල ඇතිවීම",
    warning3:
      "වර්ධනය මන්දගාමී වීම හෝ මැලවීම",
    warning4:
      "පලතුරු හෝ ධාන්‍යවල වර්ණය වෙනස් වීම",
    prevention1:
      "රෝගී ශාක කොටස් නිතිපතා ඉවත් කරන්න.",
    prevention2:
      "ඉහළ අවදානම් කාලවලදී වැළැක්වීමේ දිලීරනාශක යොදන්න.",
    prevention3:
      "හැකි අවස්ථාවල රෝග-ප්‍රතිරෝධී ප්‍රභේද භාවිත කරන්න.",
    observation: "නිරීක්ෂණය",
    chemicalTreatment:
      "රසායනික ප්‍රතිකාර",
    organicTreatment:
      "කාබනික ප්‍රතිකාර",
    followUp: "පසු විපරම",
    observationStep:
      "රෝගී කොළ සහ ශාක කොටස් ඉවත් කර ආරක්ෂිතව විනාශ කරන්න.",
    uncertainChemical:
      "අවිනිශ්චිත ස්කෑන් ප්‍රතිඵල සඳහා රසායනික ප්‍රතිකාර නිර්දේශ නොකෙරේ. කරුණාකර නැවත ස්කෑන් කරන්න.",
    followUpStep:
      "සතියකට පසු ශාකවල තත්ත්වය නැවත පරීක්ෂා කරන්න.",
    weatherUnavailable:
      "ලබාගත නොහැක",
  },

  en: {
    pageTitle: "Disease Details",
    pageTitleSub: "රෝග විස්තර",

    changeLanguage:
      "Change language",

    goBack: "Go Back",

    loading:
      "Loading details...",

    uncertainTitle:
      "Uncertain Scan Result",

    uncertainDescription:
      "This diagnosis is uncertain. Before applying chemical treatments, scan the leaf again from a closer distance under better lighting.",

    capturedImage:
      "Captured Image",

    imageAlt:
      "Scanned plant leaf",

    match: "match",

    confidence: "Confidence",

    symptoms: "Symptoms",

    environmentalFactors:
      "Environmental Factors",

    warningSigns:
      "Warning Signs",

    preventionTips:
      "Prevention Tips",

    treatmentSteps:
      "Treatment Steps",

    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind Speed",
    location: "Location",
    season: "Season",

    favorable: "Favourable",
    normal: "Normal",

    gpsActive: "GPS Active",

    highHumidity:
      "High Humidity",

    moderateHumidity:
      "Moderate Humidity",

    lowHumidity:
      "Low Humidity",

    yala: "Yala",

    yalaPeriod:
      "April - September",

    warning1:
      "Yellowing or browning of leaves",

    warning2:
      "Dark spots or lesions on foliage",

    warning3:
      "Stunted growth or wilting",

    warning4:
      "Fruit or grain discolouration",

    prevention1:
      "Remove infected plant debris regularly.",

    prevention2:
      "Apply preventive fungicide during high-risk periods.",

    prevention3:
      "Use disease-resistant crop varieties when available.",

    observation: "Observation",

    chemicalTreatment:
      "Chemical Treatment",

    organicTreatment:
      "Organic Treatment",

    followUp: "Follow-up",

    observationStep:
      "Remove and safely destroy infected leaves and plant parts.",

    uncertainChemical:
      "Chemical recommendations are withheld for uncertain scans. Please scan again.",

    followUpStep:
      "Re-inspect the plants after one week for improvement.",

    weatherUnavailable:
      "Unavailable",
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
        {language === "si"
          ? "සිං"
          : "EN"}
      </span>
    </button>
  );
}

function ResultDetailContent() {
  const router = useRouter();
  const searchParams =useSearchParams();
  const diseaseName =searchParams.get("disease") || "";
  const confidence =searchParams.get("confidence") ||"0";
  const crop =searchParams.get("crop") || "";
  const isUncertain =searchParams.get("isUncertain") === "true";
  const latitude =searchParams.get("lat");
  const longitude =searchParams.get("lng");
  const [language, setLanguage] =useState("si");
  const [image, setImage] =useState("");
  const [treatment, setTreatment] = useState(null);
  const [weather, setWeather] =useState(null);
  const [weatherLoading,setWeatherLoading,] = useState(true);
  const text =detailText[language];
  const apiUrl =process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  /*
   * Restore selected language and captured image.
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

      const storedImage =
        localStorage.getItem(
          getUserStorageKey("govi_nena_last_scan_image")
        );

      if (storedImage) {
        setImage(storedImage);
      }
    } catch (error) {
      console.error(
        "Could not restore result details:",
        error
      );
    }
  }, []);

  /*
   * Reload treatment information whenever the selected
   * language changes.
   */
  useEffect(() => {
    if (!crop || !diseaseName) {
      return;
    }

    getTreatmentOffline(
      crop,
      diseaseName,
      language
    )
      .then((data) => {
        setTreatment(data);
      })
      .catch((error) => {
        console.error(
          "Could not load treatment:",
          error
        );
      });
  }, [
    crop,
    diseaseName,
    language,
  ]);

  /*
   * Retrieve current weather using the scan coordinates.
   *
   * The backend now matches humidity to the nearest hourly
   * timestamp before returning it.
   */
  useEffect(() => {
    const controller =
      new AbortController();

    const fetchWeather =
      async () => {
        const queryLatitude =
          latitude || "6.9271";

        const queryLongitude =
          longitude || "79.8612";

        setWeatherLoading(true);

        try {
          const response = await fetch(
            `${apiUrl}/api/weather?lat=${encodeURIComponent(
              queryLatitude
            )}&lng=${encodeURIComponent(
              queryLongitude
            )}`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },

              signal:
                controller.signal,
            }
          );

          const data =
            await response
              .json()
              .catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to retrieve weather information."
            );
          }

          setWeather(data);

          /*
           * This development log lets you verify that the
           * humidity time is close to currentWeatherTime.
           */
          console.log(
            "Weather timestamp match:",
            {
              currentWeatherTime:
                data.currentWeatherTime,

              humidityTime:
                data.humidityTime,

              humidityHourlyIndex:
                data.humidityHourlyIndex,

              humidity:
                data.humidity,
            }
          );
        } catch (error) {
          if (
            error.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "Could not load weather details:",
            error
          );

          setWeather(null);
        } finally {
          if (
            !controller.signal.aborted
          ) {
            setWeatherLoading(false);
          }
        }
      };

    fetchWeather();

    return () => {
      controller.abort();
    };
  }, [
    latitude,
    longitude,
    apiUrl,
  ]);

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

  const weatherValue = (
    value,
    fallback =
      text.weatherUnavailable
  ) => {
    if (weatherLoading) {
      return "...";
    }

    return value || fallback;
  };

  /*
   * Converts a value such as "82%" into 82 and returns
   * a suitable status instead of always displaying
   * "High Risk".
   */
  const getHumidityStatus = (
    humidityValue
  ) => {
    const numericHumidity =
      Number.parseFloat(
        String(
          humidityValue || ""
        ).replace("%", "")
      );

    if (
      !Number.isFinite(
        numericHumidity
      )
    ) {
      return {
        label:
          text.weatherUnavailable,

        className:
          "text-[#888888]",
      };
    }

    if (numericHumidity >= 80) {
      return {
        label:
          text.highHumidity,

        className:
          "text-[#E65100]",
      };
    }

    if (numericHumidity >= 60) {
      return {
        label:
          text.moderateHumidity,

        className:
          "text-[#795548]",
      };
    }

    return {
      label:
        text.lowHumidity,

      className:
        "text-[#2E7D32]",
    };
  };

  const humidityStatus =
    getHumidityStatus(
      weather?.humidity
    );

  const environmentalFactors = [
    {
      id: "temperature",

      Icon: Thermometer,

      label:
        text.temperature,

      value: weatherValue(
        weather?.temperature
      ),

      status:
        text.favorable,

      statusClassName:
        "text-[#4CAF50]",

      iconClassName:
        "text-[#E65100]",

      iconBackground:
        "bg-[#FFF3E0]",
    },

    {
      id: "humidity",

      Icon: Droplets,

      label:
        text.humidity,

      value: weatherValue(
        weather?.humidity
      ),

      status:
        humidityStatus.label,

      statusClassName:
        humidityStatus.className,

      iconClassName:
        "text-blue-600",

      iconBackground:
        "bg-blue-50",
    },

    {
      id: "wind",

      Icon: Wind,

      label:
        text.wind,

      value: weatherValue(
        weather?.windSpeed
      ),

      status:
        text.normal,statusClassName:
        "text-blue-700",

      iconClassName:
        "text-blue-700",

      iconBackground:
        "bg-blue-50",
    },

    {
      id: "location",

      Icon: MapPin,

      label:
        text.location,

      value: weatherValue(
        weather?.locationName
      ),

      status:
        text.gpsActive,

      statusClassName:
        "text-[#2E7D32]",

      iconClassName:
        "text-[#2E7D32]",

      iconBackground:
        "bg-[#E8F5E9]",
    },

    {
      id: "season",

      Icon: CalendarDays,

      label:
        text.season,

      value:
        text.yala,

      status:
        text.yalaPeriod,

      statusClassName:
        "text-[#795548]",

      iconClassName:
        "text-[#795548]",

      iconBackground:
        "bg-[#F5F0ED]",
    },
  ];

  const warningSigns = [
    text.warning1,
    text.warning2,
    text.warning3,
    text.warning4,
  ];

  const preventionTips =
    treatment
      ? [
          treatment.prevention,
          text.prevention1,
          text.prevention2,
          text.prevention3,
        ]
      : [];

  const treatmentSteps =
    treatment
      ? [
          {
            label:
              text.observation,

            value:
              text.observationStep,

            headingClassName:
              "text-[#795548]",

            Icon: Leaf,
          },

          {
            label:
              text.chemicalTreatment,

            value: isUncertain
              ? text.uncertainChemical
              : treatment.chemical,

            headingClassName:
              "text-blue-700",

            Icon: CloudSun,
          },

          {
            label:
              text.organicTreatment,

            value:
              treatment.organic,

            headingClassName:
              "text-[#2E7D32]",

            Icon: Sprout,
          },

          {
            label:
              text.followUp,

            value:
              text.followUpStep,

            headingClassName:
              "text-[#E65100]",

            Icon: CheckCircle2,
          },
        ]
      : [];

  if (!treatment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F9FBF7]">
        <div className="flex flex-col items-center gap-3 text-[#1B5E20]">
          <LoaderCircle
            size={52}
            strokeWidth={3}
            className="animate-spin text-[#4CAF50]"
          />

          <p className="text-sm font-medium">
            {text.loading}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FBF7] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 rounded-b-3xl bg-[#1B5E20] px-4 pb-5 pt-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:px-6">
        <div className="mx-auto flex w-full max-w-[800px] items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            aria-label={
              text.goBack
            }
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

      <section className="mx-auto flex w-full max-w-[800px] flex-col gap-5 px-4 py-6 pb-12 sm:px-6">
        {isUncertain && (
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

        {image && (
          <article className="rounded-[20px] border border-[#E0E0E0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="mb-3 font-semibold text-[#1B5E20]">
              {
                text.capturedImage
              }
            </h2>

            <div className="relative flex max-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[#F4F6F0] shadow-inner">
              <img
                src={image}
                alt={text.imageAlt}
                className="max-h-[320px] max-w-full object-contain"
              />

              <span className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white">
                {confidence}%{" "}
                {text.match}
              </span>
            </div>
          </article>
        )}

        {/* Disease summary */}
        <article className="rounded-[20px] border border-[#E0E0E0] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <h2 className="text-2xl font-bold text-[#1B5E20] sm:text-3xl">
            {treatment.name}
          </h2>

          <p className="mt-1 break-words text-base font-semibold text-[#795548] sm:text-lg">
            {diseaseName
              .replaceAll(
                "___",
                " - "
              )
              .replaceAll(
                "_",
                " "
              )}
          </p>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="font-medium text-[#888888]">
              {text.confidence}
            </span>

            <span className="font-bold text-gray-800">
              {confidence}%
            </span>
          </div>

          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E8E8E8]">
            <div
              className="h-full rounded-full bg-[#4CAF50] transition-all duration-700"
              style={{
                width: `${Math.min(
                  Number(
                    confidence
                  ),
                  100
                )}%`,
              }}
            />
          </div>
        </article>

        {/* Symptoms */}
        <article className="rounded-[20px] border border-[#E0E0E0] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="mb-3 flex items-center gap-2 text-[#1B5E20]">
            <Leaf
              size={20}
              strokeWidth={2.2}
            />

            <h2 className="font-semibold">
              {text.symptoms}
            </h2>
          </div>

          <p className="text-sm leading-7 text-[#555555] sm:text-base">
            {treatment.symptoms}
          </p>
        </article>

        {/* Environmental factors */}
        <article className="rounded-[20px] border border-[#E0E0E0] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2 text-[#1B5E20]">
            <CloudSun
              size={21}
              strokeWidth={2.2}
            />

            <h2 className="font-semibold">
              {
                text.environmentalFactors
              }
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3">
            {environmentalFactors.map(
              (factor) => {
                const FactorIcon =
                  factor.Icon;

                return (
                  <div
                    key={factor.id}
                    className="rounded-2xl border border-[#F0F4EF] bg-[#F9FBF7] p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${factor.iconBackground}`}
                      >
                        <FactorIcon
                          size={19}
                          strokeWidth={2}
                          className={
                            factor.iconClassName
                          }
                        />
                      </div>

                      <span className="text-xs font-medium text-[#795548]">
                        {
                          factor.label
                        }
                      </span>
                    </div>

                    <p className="break-words text-lg font-bold text-[#1B5E20]">
                      {
                        factor.value
                      }
                    </p>

                    <p
                      className={`mt-1 text-xs font-semibold ${factor.statusClassName}`}
                    >
                      {
                        factor.status
                      }
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </article>

        {/* Warning signs */}
        <article className="rounded-[20px] border border-[#E0E0E0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="rounded-2xl border-2 border-[#FBC02D] bg-[#FFFDE7] p-4">
            <div className="mb-3 flex items-center gap-2 text-[#F57F17]">
              <AlertTriangle
                size={20}
                strokeWidth={2.2}
              />

              <h2 className="font-bold">
                {
                  text.warningSigns
                }
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {warningSigns.map(
                (warning) => (
                  <div
                    key={warning}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#F57F17]" />

                    <p className="text-sm leading-6 text-[#5D4037]">
                      {warning}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </article>

        {/* Prevention */}
        <article className="rounded-[20px] border border-[#E0E0E0] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2 text-[#1B5E20]">
            <ShieldCheck
              size={21}
              strokeWidth={2.2}
            />

            <h2 className="font-semibold">
              {
                text.preventionTips
              }
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {preventionTips.map(
              (tip, index) => (
                <div
                  key={`${tip}-${index}`}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-sm font-bold text-[#1B5E20]">
                    {index + 1}
                  </div>

                  <p className="pt-1 text-sm leading-6 text-[#555555] sm:text-base">
                    {tip}
                  </p>
                </div>
              )
            )}
          </div>
        </article>

        {/* Treatment steps */}
        <article className="rounded-[20px] border border-[#E0E0E0] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <div className="mb-5 flex items-center gap-2 text-[#1B5E20]">
            <Sprout
              size={21}
              strokeWidth={2.2}
            />

            <h2 className="font-semibold">
              {
                text.treatmentSteps
              }
            </h2>
          </div>

          <div className="flex flex-col">
            {treatmentSteps.map(
              (step, index) => {
                const StepIcon =
                  step.Icon;

                return (
                  <div
                    key={step.label}
                    className={`flex items-start gap-4 ${
                      index <
                      treatmentSteps.length -
                        1
                        ? "mb-4 border-b border-[#F0F0F0] pb-4"
                        : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4CAF50] text-white">
                      <StepIcon
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-sm font-semibold ${step.headingClassName}`}
                      >
                        {
                          step.label
                        }
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#555555] sm:text-base">
                        {
                          step.value
                        }
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </article>

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-[#2E7D32] bg-transparent px-5 py-4 font-semibold text-[#2E7D32] transition-colors hover:bg-[#E8F5E9] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
        >
          <ArrowLeft
            size={19}
            strokeWidth={2.2}
          />

          {text.goBack}
        </button>
      </section>
    </main>
  );
}

function ResultDetailLoadingFallback() {
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

export default function ResultDetailPage() {
  return (
    <Suspense
      fallback={
        <ResultDetailLoadingFallback />
      }
    >
      <ResultDetailContent />
    </Suspense>
  );
}