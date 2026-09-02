"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SiStripe, SiPaypal, SiGooglecloud } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({
    appName: "MaxMotion AI",
    companyName: "MaxMotion AI Technologies Inc.",
  });

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.appName) {
          setSettings({
            appName: data.appName,
            companyName: data.companyName || `${data.appName} Technologies Inc.`,
          });
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <footer className="w-full border-t border-glass-border bg-bg-page/80 backdrop-blur-md py-8 text-xs text-secondary-text mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="text-center md:text-left space-y-1">
            <Link href="/" className="text-sm font-black text-foreground uppercase tracking-tight">
              {settings.appName}
            </Link>
            <p className="text-[11px] text-muted max-w-sm">
              Next-generation multi-engine generative AI video studio powered by Seedance, Wan 2.1, Kling, and Minimax.
            </p>
          </div>

          {/* Navigation & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              Workspace
            </Link>
            <Link href="/gallery" className="hover:text-primary transition-colors">
              Gallery
            </Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund" className="hover:text-primary transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>

        {/* Badges & Copyright */}
        <div className="pt-4 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted">
          <div>
            &copy; {currentYear} {settings.companyName}. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-muted">
            <span className="flex items-center gap-1.5" title="Google Cloud Platform">
              <SiGooglecloud size={13} /> Google Cloud
            </span>
            <span className="flex items-center gap-1.5" title="Stripe Verified">
              <SiStripe size={18} /> Stripe
            </span>
            <span className="flex items-center gap-1.5" title="PayPal Verified">
              <SiPaypal size={13} /> PayPal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
