import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import CookieConsentBanner from "../components/CookieConsentBanner";
import AIAssistantModal from "../components/AIAssistantModal";
import config from "@/lib/config";

const font = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "MaxMotion AI - Next-Gen Multi-Model Video Studio",
  description: "Next-generation multi-engine generative AI video studio powered by Seedance, Wan 2.1, Kling, and Minimax.",
};

export default function RootLayout({ children }) {
  const theme = config?.theme || "slate-indigo";

  return (
    <html
      lang="en"
      className={`${font.variable} h-full w-full`}
      data-theme={theme}
    >
      <body className="font-sans h-full w-full flex flex-col antialiased bg-bg-page text-primary-text overflow-hidden">
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {children}
          </div>
          <AIAssistantModal />
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
