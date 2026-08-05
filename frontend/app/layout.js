import { Geist } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AppToaster from "@/components/AppToaster";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "Govi Nena",
  description: "Offline-first plant disease detection app",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2E7D32",
};

export default function RootLayout({ children }) {
  return (
    <html lang="si">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Govi Nena" />
      </head>
      <body className={geist.className}>
        <ServiceWorkerRegister />
        <LanguageProvider>
          {children}
          <AppToaster />
        </LanguageProvider>
      </body>
    </html>
  );
}