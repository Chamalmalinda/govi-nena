"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {Eye,EyeOff,Leaf,LoaderCircle,LockKeyhole,Phone,} from "lucide-react";
import {dismissToast,showError,showLoading,showSuccess,} from "@/lib/toast";

const loginText = {
  si: {
    appName: "ගොවි නැණ",
    tagline: "ගොවි නැණ",
    subtitle: "ඔබේ බෝග සෞඛ්‍ය සහකාරිය",
    signIn: "පුරනය වන්න",
    signInSubtitle: "ඔබගේ ගිණුමට ප්‍රවේශ වන්න",
    phoneLabel: "දුරකථන අංකය",
    phonePlaceholder: "ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න",
    passwordLabel: "මුරපදය",
    passwordPlaceholder: "ඔබගේ මුරපදය ඇතුළත් කරන්න",
    forgotPassword: "මුරපදය අමතකද?",
    loginButton: "පුරනය වන්න",
    loggingIn: "පුරනය වෙමින්...",
    noAccount: "ගිණුමක් නැද්ද?",
    registerLink: "ලියාපදිංචි වන්න",
    registrationSuccess: "ලියාපදිංචිය සාර්ථකයි! කරුණාකර ඔබගේ ගිණුමට පුරනය වන්න.",
    invalidCredentials: "දුරකථන අංකය හෝ මුරපදය වැරදියි.",
    serverError:"සේවාදායකය සමඟ සම්බන්ධ විය නොහැක.",
    unexpectedError: "අනපේක්ෂිත දෝෂයක් ඇති විය. නැවත උත්සාහ කරන්න.",
    showPassword: "මුරපදය පෙන්වන්න",
    hidePassword: "මුරපදය සඟවන්න",
    changeLanguage: "භාෂාව වෙනස් කරන්න",
    footer: "🌾 ශ්‍රී ලාංකික ගොවීන් සවිබල ගැන්වීම",
  },

  en: {
    appName: "Govi Nena",
    tagline: "Smart Farming Assistant",
    subtitle: "Your Crop Health Assistant",
    signIn: "Sign In",
    signInSubtitle: "Access your account",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter your phone number",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot Password?",
    loginButton: "Sign In",
    loggingIn: "Signing in...",
    noAccount: "Don't have an account?",
    registerLink: "Register",
    registrationSuccess: "Registration successful! Please sign in to your account.",
    invalidCredentials: "Invalid phone number or password.",
    serverError: "Cannot connect to the server.",
    unexpectedError: "An unexpected error occurred. Please try again.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    changeLanguage: "Change language",
    footer: "🌾 Empowering Sri Lankan Farmers",
  },
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState("si");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const text = loginText[language];
  const registered = searchParams.get("registered") === "true";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(
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
        "Could not load the saved language:",
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
        "Could not save the selected language:",
        error
      );
    }
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setLoginError("");
  setLoading(true);

  const loadingToast = showLoading(
    language === "si"
      ? "පුරනය වෙමින්..."
      : "Signing in..."
  );

  try {
    const response = await fetch(
      `${apiUrl}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phone: phone.trim(),
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
        data.message ||
        text.invalidCredentials;

      setLoginError(message);
      showError(message);
      return;
    }

    if (!data.token || !data.user) {
      setLoginError(
        text.unexpectedError
      );

      showError(
        text.unexpectedError
      );

      return;
    }

    localStorage.setItem(
      "govi_nena_token",
      data.token
    );

    localStorage.setItem(
      "govi_nena_user",
      JSON.stringify(data.user)
    );

    showSuccess(
      language === "si"
        ? "සාර්ථකව පුරනය විය!"
        : "Login successful!"
    );

    router.push("/home");
  } catch (error) {
    dismissToast(loadingToast);

    console.error(
      "Login request failed:",
      error
    );

    setLoginError(text.serverError);
    showError(text.serverError);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="flex min-h-screen flex-col bg-[#F9FBF7] font-sans">
      {/* Header */}
      <header className="rounded-b-2xl bg-[#1B5E20] px-6 pb-6 pt-5 text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4CAF50]">
            <Leaf
              size={40}
              strokeWidth={2}
              className="text-white"
            />
          </div>

          <h1 className="text-[26px] font-bold">
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

      {/* Login form */}
      <section className="flex flex-1 items-start justify-center px-4 py-5">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-[#E0E0E0] bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            <h2 className="text-center text-xl font-bold text-[#1B5E20]">
              {text.signIn}
            </h2>

            <p className="mt-1 text-center text-xs text-[#795548]">
              {text.signInSubtitle}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-5 flex flex-col gap-4"
            >
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
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder={text.phonePlaceholder}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border-2 border-[#C8E6C9] bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#4CAF50] disabled:cursor-not-allowed disabled:bg-gray-100"
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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder={
                      text.passwordPlaceholder
                    }
                    required
                    disabled={loading}
                    className="w-full rounded-xl border-2 border-[#C8E6C9] bg-white py-2.5 pl-10 pr-11 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-[#4CAF50] disabled:cursor-not-allowed disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
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

                <div className="mt-1.5 text-right">
                  <button
                    type="button"
                    className="text-xs font-medium text-[#4CAF50] transition-colors hover:text-[#1B5E20] hover:underline"
                  >
                    {text.forgotPassword}
                  </button>
                </div>
              </div>
              

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-4 py-3 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(27,94,32,0.28)] transition-colors hover:bg-[#2E7D32] focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#A5D6A7] disabled:shadow-none"
              >
                {loading && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                )}

                {loading
                  ? text.loggingIn
                  : text.loginButton}
              </button>
            </form>
          </div>

          {/* Register link */}
          <div className="pb-2 pt-4 text-center">
            <p className="text-[13px] text-[#795548]">
              {text.noAccount}
            </p>

            <Link
              href="/register"
              className="mt-1 inline-block text-sm font-bold text-[#1B5E20] transition-colors hover:text-[#4CAF50] hover:underline"
            >
              {text.registerLink}
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

function LoginLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FBF7]">
      <LoaderCircle
        size={48}
        className="animate-spin text-[#4CAF50]"
        aria-label="Loading"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}