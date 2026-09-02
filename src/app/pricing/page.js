"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  FaCheck,
  FaInfoCircle,
  FaCoins,
  FaKey,
  FaShieldAlt,
  FaBolt,
} from "react-icons/fa";
import { SiPaypal, SiStripe } from "react-icons/si";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function Pricing() {
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState([]);
  const [gateways, setGateways] = useState({ stripe: true, paypal: true });
  const [activeType, setActiveType] = useState("ai_included"); // 'ai_included' | 'byok'
  const [loading, setLoading] = useState(true);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState(null);
  const [processingGateway, setProcessingGateway] = useState(null);

  useEffect(() => {
    fetchPlansAndSettings();
  }, []);

  const fetchPlansAndSettings = async () => {
    try {
      setLoading(true);
      const [plansRes, settingsRes] = await Promise.all([
        fetch("/api/plans"),
        fetch("/api/settings/public"),
      ]);

      if (plansRes.ok) setPlans(await plansRes.json());
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setGateways({
          stripe: s.stripe?.enabled !== false,
          paypal: s.paypal?.enabled === true,
        });
      }
    } catch (e) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((p) => p.type === activeType);

  const handleSelectPlan = (plan) => {
    if (status !== "authenticated") {
      toast.error("Please sign in to choose a plan");
      signIn();
      return;
    }

    // If only one gateway is enabled, directly trigger it
    if (gateways.stripe && !gateways.paypal) {
      handleStripeCheckout(plan.id);
    } else if (gateways.paypal && !gateways.stripe) {
      handlePayPalCheckout(plan.id);
    } else {
      setCheckoutModalPlan(plan);
    }
  };

  const handleStripeCheckout = async (planId) => {
    try {
      setProcessingGateway("stripe");
      const { data } = await axios.post("/api/checkout", { planId });
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirection URL returned");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to trigger Stripe checkout");
    } finally {
      setProcessingGateway(null);
    }
  };

  const handlePayPalCheckout = async (planId) => {
    try {
      setProcessingGateway("paypal");
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate PayPal order");

      // For sandbox or demo, capture immediately
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderId, planId }),
      });
      const captureData = await captureRes.json();
      if (!captureRes.ok) throw new Error(captureData.error || "PayPal capture failed");

      toast.success("Payment completed successfully via PayPal!");
      setCheckoutModalPlan(null);
      setTimeout(() => {
        window.location.href = "/?success=true";
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessingGateway(null);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page select-none text-primary-text overflow-hidden">
      <Toaster position="top-right" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-10 overflow-y-auto custom-scrollbar items-center">
        {/* Title Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-1">
            <FaInfoCircle className="text-primary text-xs" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
              Pricing & Subscriptions
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            Flexible Plans for Every Creator
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text max-w-lg leading-relaxed">
            Choose between standard <strong>AI Included</strong> credit packs or our <strong>BYOK Membership</strong> to generate videos using your personal API key with 0 platform fees.
          </p>

          {/* Subscription Structure Tabs */}
          <div className="inline-flex p-1 bg-glass-bg border border-glass-border rounded-xl mt-4 shadow-lg">
            <button
              onClick={() => setActiveType("ai_included")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeType === "ai_included"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <FaCoins size={12} />
              <span>AI Included (Credit Packs)</span>
            </button>
            <button
              onClick={() => setActiveType("byok")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeType === "byok"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <FaKey size={12} />
              <span>BYOK Membership (Bring Your Own Key)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="py-24 text-center text-xs text-muted">
            No plans currently available in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-bg-card border rounded-xl p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  plan.isPopular
                    ? "border-primary shadow-xl shadow-primary/10 scale-105"
                    : "border-divider/50 shadow-md"
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-primary-text">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black tracking-tight text-white">
                        ${plan.price}
                      </span>
                      <span className="text-xs text-muted font-bold">
                        {plan.interval === "month"
                          ? "/mo"
                          : plan.interval === "year"
                          ? "/yr"
                          : "one-time"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs bg-bg-page/50 border border-divider/30 p-3 rounded-lg text-center font-extrabold text-primary">
                    {plan.type === "byok"
                      ? "Zero Platform Credit Deductions"
                      : `${plan.credits} Art Credits Included`}
                  </div>

                  <p className="text-xs text-secondary-text leading-relaxed font-medium min-h-[3rem]">
                    {plan.description}
                  </p>

                  <ul className="space-y-2 border-t border-divider/30 pt-4 text-xs font-semibold text-secondary-text">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <FaCheck className="text-primary text-[10px] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                    plan.isPopular
                      ? "bg-primary text-white hover:bg-primary-hover shadow-primary/20"
                      : "bg-glass-hover text-foreground hover:bg-glass-bg border border-glass-border"
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Dual Payment Gateway Picker Modal */}
      {checkoutModalPlan && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Select Payment Gateway</h3>
                <p className="text-[11px] text-muted">
                  {checkoutModalPlan.name} • ${checkoutModalPlan.price}
                </p>
              </div>
              <button
                onClick={() => setCheckoutModalPlan(null)}
                className="text-muted hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-secondary-text">
              Choose your preferred payment method to complete the transaction:
            </p>

            <div className="space-y-3">
              {gateways.stripe && (
                <button
                  onClick={() => handleStripeCheckout(checkoutModalPlan.id)}
                  disabled={processingGateway !== null}
                  className="w-full py-3 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  <SiStripe size={18} />
                  <span>
                    {processingGateway === "stripe" ? "Connecting..." : "Pay with Credit Card / Stripe"}
                  </span>
                </button>
              )}

              {gateways.paypal && (
                <button
                  onClick={() => handlePayPalCheckout(checkoutModalPlan.id)}
                  disabled={processingGateway !== null}
                  className="w-full py-3 px-4 bg-[#0070BA] text-white rounded-xl text-xs font-bold hover:bg-[#003087] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <SiPaypal size={16} />
                  <span>
                    {processingGateway === "paypal" ? "Processing..." : "Pay with PayPal"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
