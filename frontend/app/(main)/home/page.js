"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell,ChevronRight,CheckCircle2,Home,Leaf,LoaderCircle,LogOut,MapPin,MapPinned,UserRound,} from "lucide-react";
import { GiTomato, GiWheat, GiChiliPepper,} from "react-icons/gi";
import { showSuccess } from "@/lib/toast";
import {
  getCachedGPSCoords,
  getGPSPermissionStatus,
  saveGPSCoords,
  setGPSPermissionStatus,
  clearGPSState,
  getLastUserId,
  setLastUserId,
  getBestCoords,
  getUserStorageKey,
} from "@/lib/location";
const homeText = {
  si: {
    welcome: "ආයුබෝවන්",
    appName: "ගොවි නැණ",
    selectCrop: "ඔබේ බෝගය තෝරන්න",
    selectCropSubtitle: "රෝගය හඳුනා ගැනීමට",
    tapToScan: "රෝග හඳුනා ගැනීමට තට්ටු කරන්න",
    paddy: "වී",
    tomato: "තක්කාලි",
    chilli: "මිරිස්",
    footerMessage: "රෝග හඳුනාගෙන ප්‍රතිකාර සොයන්න",
    home: "මුල",
    map: "සිතියම",
    alerts: "ඇඟවීම්",
    logoutTitle: "ගිණුමෙන් පිටවන්න",
    changeLanguage: "භාෂාව වෙනස් කරන්න",
    loading: "පූරණය වෙමින්...",
    userError: "පරිශීලක තොරතුරු කියවිය නොහැක.",
    locationBannerTitle: "ස්ථාන ප්‍රවේශය සක්‍රීය කරන්න",
    locationBannerDesc:
      "ඔබේ ගොවිතැනට ආසන්න රෝග ව්‍යාප්ති නිවැරදිව ලුහු කිරීමට GPS ස්ථානය ලබාදෙන්න.",
    locationBannerAllow: "ස්ථානය ලබාදෙන්න",
    locationBannerSkip: "දැන් නොව",
    locationBannerRequesting: "ස්ථානය සොයමින්...",
    locationBannerGranted: "ස්ථානය සාර්ථකව ලබාගත්තා!",
    locationBannerDeniedTitle: "ස්ථාන ප්‍රවේශය ප්‍රතික්ෂේප විය",
    locationBannerDeniedDesc:
      "Browser සැකසීම් හි GPS සක්‍රීය කර නැවත ලොගින් වන්න. දිස්ත්‍රික්ක ස්ථානය භාවිතා කෙරේ.",
  },

  en: {
    welcome: "Welcome",
    appName: "Govi Nena",
    selectCrop: "Select your crop",
    selectCropSubtitle: "To identify the disease",
    tapToScan: "Tap to scan and diagnose",
    paddy: "Paddy",
    tomato: "Tomato",
    chilli: "Chilli",
    footerMessage: "Identify diseases and find treatments",
    home: "Home",
    map: "Map",
    alerts: "Alerts",
    logoutTitle: "Sign out of your account",
    changeLanguage: "Change language",
    loading: "Loading...",
    userError: "Unable to read user information.",
    locationBannerTitle: "Enable Location Access",
    locationBannerDesc:
      "Allow GPS access to accurately track nearby crop disease outbreaks near your farm.",
    locationBannerAllow: "Allow Location",
    locationBannerSkip: "Not Now",
    locationBannerRequesting: "Finding location...",
    locationBannerGranted: "Location enabled successfully!",
    locationBannerDeniedTitle: "Location Access Denied",
    locationBannerDeniedDesc:
      "Enable GPS in your browser settings and log in again. Your registered district will be used instead.",
  },
};

const crops = [
  {
    id: "paddy",
    translationKey: "paddy",
    Icon: GiWheat,
    borderColor: "border-[#E8F5E9]",
    backgroundColor: "bg-white",
    overlayColor: "bg-gradient-to-br from-[#1B5E20] to-[#4CAF50]",
    iconBackground: "bg-[#E8F5E9]",
    iconColor: "text-[#1B5E20]",
    titleColor: "text-[#1B5E20]",
    arrowColor: "text-[#1B5E20]",
  },

  {
    id: "tomato",
    translationKey: "tomato",
    Icon: GiTomato,
    borderColor: "border-[#FFEBEE]",
    backgroundColor: "bg-white",
    overlayColor: "bg-gradient-to-br from-[#B71C1C] to-[#EF5350]",
    iconBackground: "bg-[#FFEBEE]",
    iconColor: "text-[#B71C1C]",
    titleColor: "text-[#1B5E20]",
    arrowColor: "text-[#B71C1C]",
  },

  {
    id: "chili",
    translationKey: "chilli",
    Icon: GiChiliPepper,
    borderColor: "border-[#FFF3E0]",
    backgroundColor: "bg-white",
    overlayColor: "bg-gradient-to-br from-[#E65100] to-[#FF9800]",
    iconBackground: "bg-[#FFF3E0]",
    iconColor: "text-[#E65100]",
    titleColor: "text-[#1B5E20]",
    arrowColor: "text-[#E65100]",
  },
];

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState("si");
  const [user, setUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [newAlertsCount, setNewAlertsCount] = useState(0);
  const [locationPermission, setLocationPermission] = useState("prompt");
  const text = homeText[language];

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(
        "govi_nena_language"
      );

      if (savedLanguage === "si" || savedLanguage === "en") {
        setLanguage(savedLanguage);
      }

      const token = localStorage.getItem("govi_nena_token");
      const storedUser = localStorage.getItem("govi_nena_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const currentUserId = String(parsedUser._id || parsedUser.id || '');
      const lastUserId = getLastUserId();

      if (lastUserId && lastUserId !== currentUserId) {
  
        clearGPSState();
      }

 
      if (currentUserId) setLastUserId(currentUserId);


    
      const permStatus = getGPSPermissionStatus();
      if (permStatus === 'granted') {

        const cached = getCachedGPSCoords();
        if (cached) {
          setLocationPermission('granted');
        } else {

          setLocationPermission('prompt');
        }
      } else if (permStatus === 'denied') {
        setLocationPermission('denied');
      } else if (permStatus === 'skipped') {
        setLocationPermission('skipped');
      } else {
        setLocationPermission('prompt');
      }
    } catch (error) {
      console.error("Could not load user information:", error);

      setPageError(homeText[language].userError);

      localStorage.removeItem("govi_nena_token");
      localStorage.removeItem("govi_nena_user");

      router.replace("/login");
    } finally {
      setPageLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchNearbyAlerts = async () => {
      try {
        const token = localStorage.getItem("govi_nena_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const { coords } = getBestCoords(user.district);
        const [longitude, latitude] = coords;
        const response = await fetch(
          `${apiUrl}/api/alerts?lat=${latitude}&lng=${longitude}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json().catch(() => []);
        const alertsList = Array.isArray(data) ? data : (Array.isArray(data.alerts) ? data.alerts : []);

        // 3. Compare with last viewed timestamp
        const lastViewedKey = getUserStorageKey("govi_nena_alerts_last_viewed");
        const lastViewedStr = localStorage.getItem(lastViewedKey);
        const lastViewed = lastViewedStr ? Number(lastViewedStr) : 0;

        const unreadCount = alertsList.filter((alert) => {
          const alertTime = new Date(alert.createdAt).getTime();
          return alertTime > lastViewed;
        }).length;

        setNewAlertsCount(unreadCount);
      } catch (err) {
        console.error("Failed to check alert badges:", err);
      }
    };

    fetchNearbyAlerts();
  }, [user, pathname]);

  const toggleLanguage = () => {
    const nextLanguage = language === "si" ? "en" : "si";

    setLanguage(nextLanguage);

    try {
      localStorage.setItem(
        "govi_nena_language",
        nextLanguage
      );
    } catch (error) {
      console.error(
        "Could not save the selected language:",
        error
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("govi_nena_token");
    localStorage.removeItem("govi_nena_user");


    clearGPSState();

    showSuccess(
      language === "si"
        ? "සාර්ථකව ඉවත් විය!"
        : "Logged out successfully!"
    );

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };


  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      setGPSPermissionStatus('denied');
      return;
    }

    setLocationPermission('requesting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        saveGPSCoords(newCoords);
        setGPSPermissionStatus('granted');
        setLocationPermission('granted');


        setTimeout(() => setLocationPermission('hidden'), 2000);
      },
      () => {
        setGPSPermissionStatus('denied');
        setLocationPermission('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSkipLocation = () => {
    setGPSPermissionStatus('skipped');
    setLocationPermission('skipped');
  };

  const handleCropSelection = (cropId) => {
    router.push(`/scan?crop=${cropId}`);
  };

  const navigationItems = [
    {
      label: text.home,
      path: "/home",
      Icon: Home,
      active: true,
    },
    {
      label: text.map,
      path: "/heatmap",
      Icon: MapPinned,
      active: false,
    },
    {
      label: text.alerts,
      path: "/alerts",
      Icon: Bell,
      active: false,
    },
  ];

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F9FBF7]">
        <div className="flex flex-col items-center gap-3 text-[#1B5E20]">
          <LoaderCircle
            size={44}
            strokeWidth={2}
            className="animate-spin"
          />

          <p className="text-sm font-medium">
            {text.loading}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#F9FBF7] font-sans">
      {/* Header */}
      <header className="rounded-b-2xl bg-[#1B5E20] px-6 pb-6 pt-10 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        {/* User, language toggle and logout */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <UserRound
                size={20}
                strokeWidth={2}
                className="text-white"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm text-white/90">
                {text.welcome}
                {user?.name ? `, ${user.name}` : ""}
              </p>

              {user?.district && (
                <p className="mt-0.5 truncate text-[11px] text-white/65">
                  {user.district}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Language toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={text.changeLanguage}
              title={text.changeLanguage}
              className={`relative h-8 w-[72px] rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
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

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label={text.logoutTitle}
              title={text.logoutTitle}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/20 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <LogOut
                size={18}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* Application title and actions */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4CAF50]">
              <Leaf
                size={28}
                strokeWidth={2.2}
                className="text-white"
                aria-hidden="true"
              />
            </div>

            <h1 className="truncate text-2xl font-bold">
              {text.appName}
            </h1>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => router.push("/alerts")}
              aria-label={text.alerts}
              title={text.alerts}
              className="relative flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/20 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Bell
                size={20}
                strokeWidth={2}
                className={newAlertsCount > 0 ? "animate-bell-ring" : ""}
              />
              {newAlertsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm ring-1 ring-white animate-pulse">
                  {newAlertsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/heatmap")}
              aria-label={text.map}
              title={text.map}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/20 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <MapPinned
                size={20}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white/90">
          {text.selectCrop}
        </h2>

        <p className="mt-0.5 text-xs text-white/75">
          {text.selectCropSubtitle}
        </p>
      </header>

      {/* Error */}
      {pageError && (
        <div
          role="alert"
          className="mx-6 mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {pageError}
        </div>
      )}

      {/* ── Location permission banner ──────────────────────────────── */}
      {locationPermission === 'prompt' && (
        <section className="mx-6 mt-4 rounded-2xl border border-[#C8E6C9] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5E9]">
              <MapPin size={22} strokeWidth={2.2} className="text-[#1B5E20]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#1B5E20]">
                {text.locationBannerTitle}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-[#795548]">
                {text.locationBannerDesc}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAllowLocation}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B5E20] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <MapPin size={16} />
              {text.locationBannerAllow}
            </button>
            <button
              type="button"
              onClick={handleSkipLocation}
              className="rounded-xl border border-[#E0E0E0] px-4 py-2.5 text-sm font-medium text-[#795548] transition-colors hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              {text.locationBannerSkip}
            </button>
          </div>
        </section>
      )}

      {/* Requesting state — spinner replaces the card */}
      {locationPermission === 'requesting' && (
        <section className="mx-6 mt-4 flex items-center gap-3 rounded-2xl border border-[#C8E6C9] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <LoaderCircle size={22} className="animate-spin text-[#1B5E20]" />
          <p className="text-sm font-semibold text-[#1B5E20]">
            {text.locationBannerRequesting}
          </p>
        </section>
      )}

      {/* Granted state — brief success tick */}
      {locationPermission === 'granted' && (
        <section className="mx-6 mt-4 flex items-center gap-3 rounded-2xl border border-[#A5D6A7] bg-[#E8F5E9] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <CheckCircle2 size={22} className="shrink-0 text-[#2E7D32]" />
          <p className="text-sm font-semibold text-[#1B5E20]">
            {text.locationBannerGranted}
          </p>
        </section>
      )}

      {/* Denied by browser — show settings hint */}
      {locationPermission === 'denied' && (
        <section className="mx-6 mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-700">
            {text.locationBannerDeniedTitle}
          </p>
          <p className="mt-1 text-xs text-red-600">
            {text.locationBannerDeniedDesc}
          </p>
        </section>
      )}
      {/* ──────────────────────────────────────────────────────────────── */}

      {/* Crop cards */}
      <section className="flex flex-1 flex-col gap-4 px-6 py-6">
        {crops.map((crop) => {
          const CropIcon = crop.Icon;

          return (
            <button
              key={crop.id}
              type="button"
              onClick={() =>
                handleCropSelection(crop.id)
              }
              className={`group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2 ${crop.backgroundColor} ${crop.borderColor}`}
            >
              {/* Light gradient overlay */}
              <div
                className={`pointer-events-none absolute inset-0 rounded-2xl opacity-[0.05] ${crop.overlayColor}`}
              />

              <div className="relative flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${crop.iconBackground}`}
                >
                  <CropIcon
                    size={28}
                    strokeWidth={2.5}
                    className={crop.iconColor}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-lg font-bold ${crop.titleColor}`}
                  >
                    {text[crop.translationKey]}
                  </h3>

                  <p className="mt-0.5 text-xs text-[#795548]">
                    {text.tapToScan}
                  </p>
                </div>

                <ChevronRight
                  size={24}
                  strokeWidth={2.5}
                  className={`shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${crop.arrowColor}`}
                  aria-hidden="true"
                />
              </div>
            </button>
          );
        })}
      </section>

      {/* Green information strip */}
      <section className="bg-[#4CAF50] px-6 py-3 text-center">
        <p className="text-sm font-medium text-white">
          {text.footerMessage}
        </p>
      </section>

      {/* Bottom navigation — Scan removed */}
      <nav
        aria-label="Main navigation"
        className="sticky bottom-0 grid grid-cols-3 border-t border-[#E0E0E0] bg-white px-6 py-3 shadow-[0_-3px_12px_rgba(0,0,0,0.04)]"
      >
        {navigationItems.map((item) => {
          const NavigationIcon = item.Icon;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              aria-current={item.active ? "page" : undefined}
              className="flex flex-col items-center gap-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  item.active
                    ? "bg-[#E8F5E9]"
                    : "bg-transparent"
                }`}
              >
                <NavigationIcon
                  size={18}
                  strokeWidth={1.8}
                  className={
                    item.active
                      ? "text-[#2E7D32]"
                      : "text-[#BBBBBB]"
                  }
                />
              </span>

              <span
                className={`text-[10px] ${
                  item.active
                    ? "font-semibold text-[#2E7D32]"
                    : "font-normal text-[#BBBBBB]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </main>
  );
}