"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaCookieBite, FaShieldAlt } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("maxmotion_cookie_consent");
      if (!consent) {
        setShowBanner(true);
      }
    } catch (e) {}
  }, []);

  const handleConsent = (level) => {
    try {
      localStorage.setItem("maxmotion_cookie_consent", level);
    } catch (e) {}
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[300] bg-neutral-900/95 border border-glass-border p-4 rounded-2xl shadow-2xl backdrop-blur-xl space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary shrink-0">
              <FaCookieBite size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Privacy & Cookie Consent</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-glass-hover text-muted font-normal">
                  GDPR & CCPA
                </span>
              </h4>
              <p className="text-[11px] text-muted leading-relaxed">
                We use strictly essential cookies for authentication and performance telemetry. You can learn more in our{" "}
                <Link href="/privacy" className="text-primary underline hover:text-primary-hover">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => handleConsent("essential")}
              className="px-3 py-1.5 rounded-lg border border-glass-border hover:bg-glass-hover text-[10px] font-bold text-muted hover:text-foreground transition-all"
            >
              Essential Only
            </button>
            <button
              onClick={() => handleConsent("all")}
              className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[10px] font-bold shadow-md shadow-primary/20 transition-all"
            >
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
