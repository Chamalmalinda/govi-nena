"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import {
  dismissToast,
  showError,
  showLoading,
  showSuccess,
  showWarning,
} from "@/lib/toast";

const registerText = {
  si: {
    appName: "ගොවි නැණ",
    tagline: "ලියාපදිංචි වන්න",
    subtitle: "නව ගිණුමක් සාදන්න",

    fullNameLabel: "සම්පූර්ණ නම",
    fullNamePlaceholder: "ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න",

    emailLabel: "විද්‍යුත් තැපෑල",
    emailPlaceholder: "ඔබගේ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න",

    phoneLabel: "දුරකථන අංකය",
    phonePlaceholder: "07XXXXXXXX",

    districtLabel: "දිස්ත්‍රික්කය",
    districtPlaceholder: "දිස්ත්‍රික්කය තෝරන්න",

    passwordLabel: "මුරපදය",
    passwordPlaceholder: "මුරපදයක් සාදන්න",

    registerButton: "ගිණුම සාදන්න",
    registering: "ගිණුම සාදමින්...",

    alreadyAccount: "දැනටමත් ගිණුමක් තිබේද?",
    loginLink: "පුරනය වන්න",

    invalidPhone:
      "වලංගු ශ්‍රී ලංකා දුරකථන අංකයක් ඇතුළත් කරන්න. උදා: 0771234567",

    invalidEmail:
      "වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.",

    weakPassword:
      "මුරපදය අවම වශයෙන් අක්ෂර 6ක් අඩංගු විය යුතුය.",

    registrationFailed: "ලියාපදිංචි වීම අසාර්ථකයි.",
    serverError: "සේවාදායකය සමඟ සම්බන්ධ විය නොහැක.",
    unexpectedError:
      "අනපේක්ෂිත දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න.",

    showPassword: "මුරපදය පෙන්වන්න",
    hidePassword: "මුරපදය සඟවන්න",
    changeLanguage: "භාෂාව වෙනස් කරන්න",

    footer: "🌾 ශ්‍රී ලාංකික ගොවීන් සවිබල ගැන්වීම",
  },

  en: {
    appName: "Govi Nena",
    tagline: "Register",
    subtitle: "Create your new account",

    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter your full name",

    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",

    phoneLabel: "Phone Number",
    phonePlaceholder: "07XXXXXXXX",

    districtLabel: "District",
    districtPlaceholder: "Select your district",

    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",

    registerButton: "Create Account",
    registering: "Creating account...",

    alreadyAccount: "Already have an account?",
    loginLink: "Sign In",

    invalidPhone:
      "Enter a valid Sri Lankan phone number. Example: 0771234567",

    invalidEmail: "Enter a valid email address.",

    weakPassword:
      "The password must contain at least 6 characters.",

    registrationFailed: "Registration failed.",
    serverError: "Cannot connect to the server.",
    unexpectedError:
      "An unexpected error occurred. Please try again.",

    showPassword: "Show password",
    hidePassword: "Hide password",
    changeLanguage: "Change language",

    footer: "🌾 Empowering Sri Lankan Farmers",
  },
};

const districts = [
  { value: "Colombo", en: "Colombo", si: "කොළඹ" },
  { value: "Gampaha", en: "Gampaha", si: "ගම්පහ" },
  { value: "Kalutara", en: "Kalutara", si: "කළුතර" },
  { value: "Kandy", en: "Kandy", si: "මහනුවර" },
  { value: "Matale", en: "Matale", si: "මාතලේ" },
  {
    value: "Nuwara Eliya",
    en: "Nuwara Eliya",
    si: "නුවරඑළිය",
  },
  { value: "Galle", en: "Galle", si: "ගාල්ල" },
  { value: "Matara", en: "Matara", si: "මාතර" },
  {
    value: "Hambantota",
    en: "Hambantota",
    si: "හම්බන්තොට",
  },
  { value: "Jaffna", en: "Jaffna", si: "යාපනය" },
  { value: "Mannar", en: "Mannar", si: "මන්නාරම" },
  {
    value: "Vavuniya",
    en: "Vavuniya",
    si: "වවුනියාව",
  },
  {
    value: "Anuradhapura",
    en: "Anuradhapura",
    si: "අනුරාධපුර",
  },
  {
    value: "Polonnaruwa",
    en: "Polonnaruwa",
    si: "පොළොන්නරුව",
  },
  {
    value: "Kurunegala",
    en: "Kurunegala",
    si: "කුරුණෑගල",
  },
  {
    value: "Puttalam",
    en: "Puttalam",
    si: "පුත්තලම",
  },
  { value: "Badulla", en: "Badulla", si: "බදුල්ල" },
  {
    value: "Monaragala",
    en: "Monaragala",
    si: "මොණරාගල",
  },
  {
    value: "Ratnapura",
    en: "Ratnapura",
    si: "රත්නපුර",
  },
  { value: "Kegalle", en: "Kegalle", si: "කෑගල්ල" },
  {
    value: "Trincomalee",
    en: "Trincomalee",
    si: "ත්‍රිකුණාමලය",
  },
  {
    value: "Batticaloa",
    en: "Batticaloa",
    si: "මඩකළපුව",
  },
  { value: "Ampara", en: "Ampara", si: "අම්පාර" },
  {
    value: "Kilinochchi",
    en: "Kilinochchi",
    si: "කිලිනොච්චිය",
  },
  {
    value: "Mullaitivu",
    en: "Mullaitivu",
    si: "මුලතිව්",
  },
];

export default function RegisterPage() {
  const router = useRouter();

  const [language, setLanguage] = useState("si");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const text = registerText[language];

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(
        "govi_nena_language"
      );

      if (savedLanguage === "si" || savedLanguage === "en") {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error(
        "Could not load the saved language:",
        error
      );
    }
  }, []);

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

  const validatePhone = (number) => {
    const cleanedNumber = number.replace(/[\s-]/g, "");

    return /^(?:0|94|\+94)?7\d{8}$/.test(cleanedNumber);
  };

  const validateEmail = (emailAddress) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      emailAddress.trim()
    );
  };

  const clearErrors = () => {
    setPhoneError("");
    setEmailError("");
    setPasswordError("");
    setFormError("");
  };

  const validateForm = () => {
    let isValid = true;

    clearErrors();

    if (!validateEmail(email)) {
      setEmailError(text.invalidEmail);
      isValid = false;
    }

    if (!validatePhone(phone)) {
      setPhoneError(text.invalidPhone);
      isValid = false;
    }

    if (password.length < 6) {
      setPasswordError(text.weakPassword);
      isValid = false;
    }

    return isValid;
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);

  const loadingToast = showLoading(
    language === "si"
      ? "ගිණුම සාදමින්..."
      : "Creating account..."
  );

  try {
    const response = await fetch(
      `${apiUrl}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.replace(/[\s-]/g, ""),
          district,
          password,
        }),
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    dismissToast(loadingToast);

    if (!response.ok) {
      const message =
        data.message || text.registrationFailed;

      setFormError(message);
      showError(message);
      return;
    }

    showSuccess(
      language === "si"
        ? "ගිණුම සාර්ථකව සාදන ලදී!"
        : "Account created successfully!"
    );

    router.push("/login?registered=true");
  } catch (error) {
    dismissToast(loadingToast);

    console.error(
      "Registration request failed:",
      error
    );

    setFormError(text.serverError);
    showError(text.serverError);
  } finally {
    setLoading(false);
  }
};

  const inputClassName =
    "w-full rounded-xl border-2 border-[#C8E6C9] bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#4CAF50] disabled:cursor-not-allowed disabled:bg-gray-100";

  return (
    <main className="flex min-h-screen flex-col bg-[#F9FBF7] font-sans">
      {/* Header */}
      <header className="rounded-b-2xl bg-[#1B5E20] px-6 pb-5 pt-5 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        {/* Language toggle inside header */}
        <div className="mb-4 flex items-center justify-end">
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
        </div>

        {/* Logo and title */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4CAF50]">
            <Leaf
              size={34}
              strokeWidth={2}
              className="text-white"
            />
          </div>

          <h1 className="text-[24px] font-bold">
            {text.appName}
          </h1>

          <p className="text-sm font-semibold text-[#C8E6C9]">
            {text.tagline}
          </p>

          <p className="text-xs text-white/80">
            {text.subtitle}
          </p>
        </div>
      </header>

      {/* Registration form */}
      <section className="flex-1 px-4 py-5">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">


            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {/* Full name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-[13px] font-semibold text-[#1B5E20]"
                >
                  {text.fullNameLabel}
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4CAF50]"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder={text.fullNamePlaceholder}
                    required
                    disabled={loading}
                    className={inputClassName}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[13px] font-semibold text-[#1B5E20]"
                >
                  {text.emailLabel}
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4CAF50]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (emailError) {
                        setEmailError("");
                      }
                    }}
                    placeholder={text.emailPlaceholder}
                    required
                    disabled={loading}
                    aria-invalid={Boolean(emailError)}
                    className={`${inputClassName} ${
                      emailError
                        ? "border-red-400 focus:border-red-500"
                        : ""
                    }`}
                  />
                </div>

              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-[13px] font-semibold text-[#1B5E20]"
                >
                  {text.phoneLabel}
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4CAF50]"
                  />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);

                      if (phoneError) {
                        setPhoneError("");
                      }
                    }}
                    placeholder={text.phonePlaceholder}
                    required
                    disabled={loading}
                    aria-invalid={Boolean(phoneError)}
                    className={`${inputClassName} ${
                      phoneError
                        ? "border-red-400 focus:border-red-500"
                        : ""
                    }`}
                  />
                </div>

              </div>

              {/* District */}
              <div>
                <label
                  htmlFor="district"
                  className="mb-1.5 block text-[13px] font-semibold text-[#1B5E20]"
                >
                  {text.districtLabel}
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4CAF50]"
                  />

                  <select
                    id="district"
                    name="district"
                    value={district}
                    onChange={(event) =>
                      setDistrict(event.target.value)
                    }
                    required
                    disabled={loading}
                    className={`${inputClassName} appearance-none pr-10`}
                  >
                    <option value="">
                      {text.districtPlaceholder}
                    </option>

                    {districts.map((districtItem) => (
                      <option
                        key={districtItem.value}
                        value={districtItem.value}
                      >
                        {districtItem[language]}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#795548]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[13px] font-semibold text-[#1B5E20]"
                >
                  {text.passwordLabel}
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4CAF50]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (passwordError) {
                        setPasswordError("");
                      }
                    }}
                    placeholder={text.passwordPlaceholder}
                    required
                    minLength={6}
                    disabled={loading}
                    aria-invalid={Boolean(passwordError)}
                    className={`${inputClassName} pr-11 ${
                      passwordError
                        ? "border-red-400 focus:border-red-500"
                        : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previousValue) => !previousValue
                      )
                    }
                    aria-label={
                      showPassword
                        ? text.hidePassword
                        : text.showPassword
                    }
                    title={
                      showPassword
                        ? text.hidePassword
                        : text.showPassword
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#795548] transition-colors hover:bg-[#E8F5E9] hover:text-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                        strokeWidth={2}
                      />
                    ) : (
                      <Eye
                        size={18}
                        strokeWidth={2}
                      />
                    )}
                  </button>
                </div>

              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-3 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(27,94,32,0.28)] transition-colors hover:bg-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#A5D6A7] disabled:shadow-none"
              >
                {loading && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                )}

                {loading
                  ? text.registering
                  : text.registerButton}
              </button>
            </form>
          </div>

          {/* Login link */}
          <div className="pb-2 pt-4 text-center">
            <p className="text-[13px] text-[#795548]">
              {text.alreadyAccount}
            </p>

            <Link
              href="/login"
              className="mt-1 inline-block text-sm font-bold text-[#1B5E20] transition-colors hover:text-[#4CAF50] hover:underline"
            >
              {text.loginLink}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E8F5E9] px-6 py-3 text-center">
        <p className="text-xs font-medium text-[#2E7D32]">
          {text.footer}
        </p>
      </footer>
    </main>
  );
}