"use client";

import { useState } from "react";
import {
  FaCalculator,
  FaCoins,
  FaChartLine,
  FaServer,
  FaDollarSign,
  FaPercentage,
  FaLightbulb,
} from "react-icons/fa";

export default function PricingCalculatorPage() {
  // Simulator Controls
  const [creditPricePer100, setCreditPricePer100] = useState(5.0); // $5 for 100 credits ($0.05 / credit)
  const [monthlyGenerations, setMonthlyGenerations] = useState(10000);
  const [avgCreditsPerVideo, setAvgCreditsPerVideo] = useState(30);

  // Model Mix Distribution (%)
  const [mixWan, setMixWan] = useState(40);
  const [mixKling, setMixKling] = useState(25);
  const [mixSeedance, setMixSeedance] = useState(20);
  const [mixMinimax, setMixMinimax] = useState(15);

  // Wholesale API costs per 5s video
  const WHOLESALE_COSTS = {
    wan: 0.04,       // Wan 2.1 14B via Fal.ai (~$0.04)
    kling: 0.10,     // Kling 1.5 Pro via Fal.ai (~$0.10)
    seedance: 0.06,  // Seedance 2.0 via MuAPI (~$0.06)
    minimax: 0.08,   // Minimax Hailuo (~$0.08)
  };

  // Blended Wholesale Cost per Video
  const blendedWholesaleCost =
    (mixWan / 100) * WHOLESALE_COSTS.wan +
    (mixKling / 100) * WHOLESALE_COSTS.kling +
    (mixSeedance / 100) * WHOLESALE_COSTS.seedance +
    (mixMinimax / 100) * WHOLESALE_COSTS.minimax;

  // Retail Revenue per Video
  const pricePerCredit = creditPricePer100 / 100;
  const retailRevenuePerVideo = avgCreditsPerVideo * pricePerCredit;

  // Financial Metrics
  const grossMarginPercent =
    retailRevenuePerVideo > 0
      ? Math.round(((retailRevenuePerVideo - blendedWholesaleCost) / retailRevenuePerVideo) * 100)
      : 0;

  const monthlyGrossRevenue = monthlyGenerations * retailRevenuePerVideo;
  const monthlyGPUCost = monthlyGenerations * blendedWholesaleCost;
  const monthlyNetProfit = monthlyGrossRevenue - monthlyGPUCost;
  const annualNetProfit = monthlyNetProfit * 12;

  // Package Tier Projections
  const packages = [
    { name: "Starter Pack", price: 5, credits: 100, videos: 3.3 },
    { name: "Standard Pack", price: 10, credits: 250, videos: 8.3 },
    { name: "Pro Creator", price: 25, credits: 700, videos: 23.3 },
    { name: "Studio Agency", price: 60, credits: 2000, videos: 66.6 },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
          <FaCalculator className="text-primary" size={20} />
          <span>Pricing & Margin Calculator</span>
        </h1>
        <p className="text-xs text-muted mt-1">
          Model upstream GPU inference costs, retail credit packages, and calculate real-time gross profit margins.
        </p>
      </div>

      {/* Primary KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Margin % */}
        <div className="p-5 bg-glass-bg border border-glass-border rounded-xl space-y-1 shadow">
          <span className="text-[10px] font-bold uppercase text-muted flex items-center gap-1">
            <FaPercentage size={10} className="text-primary" /> Gross Profit Margin
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black tracking-tight ${
                grossMarginPercent >= 65
                  ? "text-emerald-400"
                  : grossMarginPercent >= 45
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {grossMarginPercent}%
            </span>
            <span className="text-[10px] text-muted">
              {grossMarginPercent >= 65 ? "Healthy" : "Low"}
            </span>
          </div>
          <p className="text-[10px] text-muted">
            Net: ${(retailRevenuePerVideo - blendedWholesaleCost).toFixed(2)} per generation
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="p-5 bg-glass-bg border border-glass-border rounded-xl space-y-1 shadow">
          <span className="text-[10px] font-bold uppercase text-muted flex items-center gap-1">
            <FaDollarSign size={10} className="text-primary" /> Projected Monthly Rev
          </span>
          <div className="text-3xl font-black tracking-tight text-foreground">
            ${Math.round(monthlyGrossRevenue).toLocaleString()}
          </div>
          <p className="text-[10px] text-muted">
            From {monthlyGenerations.toLocaleString()} generations
          </p>
        </div>

        {/* Monthly GPU Cost */}
        <div className="p-5 bg-glass-bg border border-glass-border rounded-xl space-y-1 shadow">
          <span className="text-[10px] font-bold uppercase text-muted flex items-center gap-1">
            <FaServer size={10} className="text-primary" /> Wholesale GPU Cost
          </span>
          <div className="text-3xl font-black tracking-tight text-red-400">
            ${Math.round(monthlyGPUCost).toLocaleString()}
          </div>
          <p className="text-[10px] text-muted">
            Blended avg: ${blendedWholesaleCost.toFixed(3)} / clip
          </p>
        </div>

        {/* Monthly Net Profit */}
        <div className="p-5 bg-glass-bg border border-glass-border rounded-xl space-y-1 shadow">
          <span className="text-[10px] font-bold uppercase text-muted flex items-center gap-1">
            <FaChartLine size={10} className="text-primary" /> Monthly Net Profit
          </span>
          <div className="text-3xl font-black tracking-tight text-emerald-400">
            ${Math.round(monthlyNetProfit).toLocaleString()}
          </div>
          <p className="text-[10px] text-muted">
            Annual: ${(annualNetProfit / 1000).toFixed(1)}k ARR
          </p>
        </div>
      </div>

      {/* Simulator Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retail Pricing Controls */}
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-5 shadow-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <FaCoins size={12} /> Retail Pricing & Volume Sliders
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Retail Price per 100 Credits:</span>
              <span className="font-bold text-foreground font-mono">
                ${creditPricePer100.toFixed(2)} (${(creditPricePer100 / 100).toFixed(3)} / credit)
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="15.0"
              step="0.5"
              value={creditPricePer100}
              onChange={(e) => setCreditPricePer100(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Monthly Video Volume:</span>
              <span className="font-bold text-foreground font-mono">
                {monthlyGenerations.toLocaleString()} clips/mo
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={monthlyGenerations}
              onChange={(e) => setMonthlyGenerations(parseInt(e.target.value, 10))}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Avg Credits Charged per Video:</span>
              <span className="font-bold text-foreground font-mono">
                {avgCreditsPerVideo} credits
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={avgCreditsPerVideo}
              onChange={(e) => setAvgCreditsPerVideo(parseInt(e.target.value, 10))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        {/* Wholesale Provider Benchmark Mix */}
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4 shadow-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <FaServer size={12} /> Model Usage Mix & Wholesale Costs
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground">Wan 2.1 (Alibaba)</span>
                <span className="text-[10px] text-muted block">Wholesale: $0.040 / 5s</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mixWan}
                  onChange={(e) => setMixWan(parseInt(e.target.value, 10) || 0)}
                  className="w-16 px-2 py-1 bg-glass-hover border border-glass-border rounded text-center text-foreground font-mono"
                />
                <span className="text-muted">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground">Kling 1.5 Pro</span>
                <span className="text-[10px] text-muted block">Wholesale: $0.100 / 5s</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mixKling}
                  onChange={(e) => setMixKling(parseInt(e.target.value, 10) || 0)}
                  className="w-16 px-2 py-1 bg-glass-hover border border-glass-border rounded text-center text-foreground font-mono"
                />
                <span className="text-muted">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground">Seedance 2.0 / Mini</span>
                <span className="text-[10px] text-muted block">Wholesale: $0.060 / 5s</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mixSeedance}
                  onChange={(e) => setMixSeedance(parseInt(e.target.value, 10) || 0)}
                  className="w-16 px-2 py-1 bg-glass-hover border border-glass-border rounded text-center text-foreground font-mono"
                />
                <span className="text-muted">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground">Minimax Hailuo</span>
                <span className="text-[10px] text-muted block">Wholesale: $0.080 / 5s</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mixMinimax}
                  onChange={(e) => setMixMinimax(parseInt(e.target.value, 10) || 0)}
                  className="w-16 px-2 py-1 bg-glass-hover border border-glass-border rounded text-center text-foreground font-mono"
                />
                <span className="text-muted">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Tier Margin Matrix */}
      <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4 shadow-lg">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <FaLightbulb className="text-amber-400" /> Package Margins at Current Pricing ($
          {creditPricePer100.toFixed(2)}/100 credits)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg, i) => {
            const wholesaleCost = (pkg.credits / avgCreditsPerVideo) * blendedWholesaleCost;
            const netProfit = pkg.price - wholesaleCost;
            const margin = Math.round((netProfit / pkg.price) * 100);

            return (
              <div
                key={i}
                className="p-4 bg-glass-hover border border-glass-border rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground">{pkg.name}</h3>
                  <span className="text-xs font-black text-primary">${pkg.price}</span>
                </div>
                <div className="text-[11px] text-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Credits:</span>
                    <span className="font-mono text-foreground font-bold">{pkg.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. GPU Cost:</span>
                    <span className="font-mono text-red-400 font-bold">
                      ${wholesaleCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Profit:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ${netProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-glass-border">
                    <span>Profit Margin:</span>
                    <span className="font-mono font-black text-foreground">{margin}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
