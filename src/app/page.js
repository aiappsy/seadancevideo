"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaPlay,
  FaArrowRight,
  FaBolt,
  FaFilm,
  FaShieldAlt,
  FaMagic,
  FaCompass,
  FaKey,
  FaShareAlt,
  FaDownload,
  FaCloud,
  FaFire,
} from "react-icons/fa";
import { defaultTemplates } from "@/lib/templates";
import Footer from "@/components/Footer";
import Tooltip from "@/components/Tooltip";

export default function LandingPage() {
  const router = useRouter();
  const [appName, setAppName] = useState("MaxMotion AI");
  const [promptInput, setPromptInput] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("wan-2.1");
  const [templates, setTemplates] = useState(defaultTemplates);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.appName) setAppName(data.appName);
        if (data?.templates && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const categories = ["All", ...Array.from(new Set(templates.map((t) => t.category || "General")))];

  const filteredTemplates =
    activeCategory === "All"
      ? templates
      : templates.filter((t) => (t.category || "General") === activeCategory);

  const handleLaunchWithPrompt = (promptText = promptInput, modelChoice = selectedEngine, ratio = "16:9") => {
    const params = new URLSearchParams({
      prompt: promptText.trim() || "A cinematic scene with volumetric golden hour lighting",
      model: modelChoice,
      aspectRatio: ratio,
    });
    router.push(`/workspace?${params.toString()}`);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col bg-bg-page text-foreground selection:bg-amber-400 selection:text-black">
      {/* 1. ART-LIST INSPIRED HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 overflow-hidden">
        {/* Cinematic Atmospheric Backdrop & Vignette */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-500/15 via-primary/20 to-purple-600/10 rounded-full blur-3xl opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--tw-gradient-stops))] from-transparent via-bg-page/40 to-bg-page" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_70%,var(--color-bg-page,#0a0a0f)_100%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-7">
          {/* Top Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold backdrop-blur-md animate-fade-in shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Next-Gen Video Generation Engine Active</span>
            <span className="opacity-40">|</span>
            <span className="text-[11px] text-muted">5 World-Class Models</span>
          </div>

          {/* Mixed Typography Headline (Bold Sans + Elegant Italic Serif) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
            Make your best{" "}
            <span className="font-serif italic font-normal bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent px-1">
              creative work
            </span>{" "}
            with AI
          </h1>

          {/* Supported AI Models Social Proof Strip (Artlist style) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 text-xs text-secondary-text">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass-bg border border-glass-border">
              <span className="text-amber-400">⚡</span> Seedance 2.0
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass-bg border border-glass-border">
              <span className="text-blue-400">🎬</span> Wan 2.1 (14B)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass-bg border border-glass-border">
              <span className="text-emerald-400">🦾</span> Kling 1.5 Pro
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass-bg border border-glass-border">
              <span className="text-purple-400">🎭</span> Minimax Hailuo
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-glass-bg border border-glass-border">
              <span className="text-pink-400">✨</span> OpenRouter Copilot
            </span>
          </div>

          {/* Radiant Amber Pill Button (Artlist style) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-black font-black text-sm tracking-wide uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(251,191,36,0.45)] hover:shadow-[0_0_45px_rgba(251,191,36,0.65)] flex items-center gap-3 group border border-amber-200"
            >
              <span>Start Free Now</span>
              <FaArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/gallery"
              className="px-6 py-4 rounded-full bg-glass-bg hover:bg-glass-hover border border-glass-border text-foreground font-bold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <FaPlay size={10} className="text-amber-400" />
              <span>Explore Creations</span>
            </Link>
          </div>

          {/* Subtitle Under Button */}
          <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto font-normal leading-relaxed pt-1">
            Everything creative professionals need to direct photorealistic AI videos with total control.
          </p>

          {/* 2. INTERACTIVE QUICK STUDIO PROMPT BAR */}
          <div className="pt-4 max-w-2xl mx-auto w-full">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLaunchWithPrompt();
              }}
              className="p-2 bg-glass-bg border border-glass-border/80 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row gap-2 items-center"
            >
              <div className="flex-1 w-full flex items-center gap-2 px-3 py-1">
                <FaMagic className="text-amber-400 shrink-0" size={14} />
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe any scene... (e.g. Hypercar drifting on an alpine pass at sunset)"
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-foreground placeholder:text-muted"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="px-2.5 py-2 bg-black/40 border border-glass-border rounded-xl text-[11px] text-muted focus:text-foreground outline-none font-medium"
                >
                  <option value="wan-2.1">Wan 2.1 (Cinematic)</option>
                  <option value="kling-1.5">Kling 1.5 (Physics)</option>
                  <option value="minimax">Minimax (Actors)</option>
                  <option value="seedance-2.0">Seedance 2.0</option>
                  <option value="seedance-mini">Seedance Mini (50% off)</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 shrink-0"
                >
                  Direct Video
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. WHICH AI MODEL SHOULD YOU DIRECT? (PLAIN-ENGLISH GUIDE) */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-glass-border">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
            Model Directing Guide
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
            Which AI model should you use for your project?
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            No single AI model is best at everything. MaxMotion AI unites the world’s top video engines under one roof so you always have the right lens for every scene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Wan 2.1 Card */}
          <div className="p-6 bg-glass-bg border border-glass-border rounded-2xl space-y-4 hover:border-amber-400/40 transition-all group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center font-bold">
                🎬
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 uppercase">
                Alibaba 14B
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Wan 2.1</h3>
              <p className="text-xs font-medium text-amber-300/90 mt-0.5">Lighting, Landscapes & Scenery</p>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Produces breathtaking 35mm film textures, volumetric lighting, expansive sci-fi landscapes, and atmospheric haze at our lowest credit rate.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-secondary-text">
              ✨ Best for: Drone shots, architecture, neon rain, nature.
            </div>
          </div>

          {/* Kling 1.5 Pro Card */}
          <div className="p-6 bg-glass-bg border border-glass-border rounded-2xl space-y-4 hover:border-blue-400/40 transition-all group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-blue-400/10 text-blue-300 flex items-center justify-center font-bold">
                🦾
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-400/20 text-blue-300 uppercase">
                Physics King
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Kling 1.5 Pro</h3>
              <p className="text-xs font-medium text-blue-300/90 mt-0.5">Realistic Human Movement & Anatomy</p>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              The benchmark for coherent physical dynamics. Preserves human hand anatomy, realistic walking, dancing, and fluid martial arts combat.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-secondary-text">
              ✨ Best for: Human actors, sports, fluid choreography.
            </div>
          </div>

          {/* Minimax Hailuo Card */}
          <div className="p-6 bg-glass-bg border border-glass-border rounded-2xl space-y-4 hover:border-purple-400/40 transition-all group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-purple-400/10 text-purple-300 flex items-center justify-center font-bold">
                🎭
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-400/20 text-purple-300 uppercase">
                Acting & Drama
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Minimax Hailuo</h3>
              <p className="text-xs font-medium text-purple-300/90 mt-0.5">Expressive Facial Micro-Expressions</p>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Specialized in subtle facial emotions, intimate dialogue, character close-ups, and dramatic narrative storytelling with emotional depth.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-secondary-text">
              ✨ Best for: Character portraits, dialogue, cinematic drama.
            </div>
          </div>

          {/* Seedance 2.0 Card */}
          <div className="p-6 bg-glass-bg border border-glass-border rounded-2xl space-y-4 hover:border-emerald-400/40 transition-all group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-emerald-400/10 text-emerald-300 flex items-center justify-center font-bold">
                ⚡
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 uppercase">
                High Speed
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Seedance 2.0 & Mini</h3>
              <p className="text-xs font-medium text-emerald-300/90 mt-0.5">High-Energy Action & 50% Off Previews</p>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              ByteDance’s high-velocity engine delivers explosive motion and vehicle drifts. Seedance Mini cuts credit costs by 50% for fast idea prototyping.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-secondary-text">
              ✨ Best for: Action sequences, fast testing, rapid turnaround.
            </div>
          </div>
        </div>
      </section>

      {/* 4. 12+ CURATED TEMPLATES SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-glass-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
              Production-Grade Inspiration
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mt-1">
              Curated Styles & Storyboard Presets
            </h2>
            <p className="text-xs text-muted mt-1">
              Click any template to instantly load the camera directives and optimal engine into the Studio workspace.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                    : "bg-glass-bg hover:bg-glass-hover text-muted border border-glass-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 bg-glass-bg border border-glass-border rounded-2xl space-y-3 flex flex-col justify-between hover:border-amber-400/40 hover:-translate-y-1 transition-all shadow-lg group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary uppercase">
                    {tpl.category || "Cinematic"}
                  </span>
                  <span className="text-[10px] font-mono text-muted uppercase">
                    {tpl.model} • {tpl.aspectRatio || "16:9"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-amber-300 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed line-clamp-3 italic">
                  &ldquo;{tpl.prompt}&rdquo;
                </p>
              </div>

              <button
                onClick={() => handleLaunchWithPrompt(tpl.prompt, tpl.model, tpl.aspectRatio)}
                className="w-full py-2.5 bg-glass-hover hover:bg-amber-400 hover:text-black border border-glass-border text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2 shadow"
              >
                <FaFilm size={11} />
                <span>Direct This Scene</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TWO WAYS TO CREATE: AI INCLUDED OR BYOK */}
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full border-t border-glass-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
              Flexible Freedom
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
              Create with built-in GPU credits, or bring your own API key for $0 platform fees.
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Whether you are an independent creator who wants a simple all-in-one monthly plan, or a developer with direct Fal.ai / MuAPI accounts, MaxMotion AI adapts to your workflow.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/20 flex items-center gap-2"
              >
                <span>View Credit Plans</span>
                <FaArrowRight size={11} />
              </Link>
              <Link
                href="/settings"
                className="px-6 py-3 rounded-xl bg-glass-bg hover:bg-glass-hover border border-glass-border text-foreground font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <FaKey size={11} className="text-amber-400" />
                <span>Configure BYOK</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-glass-bg border border-glass-border rounded-2xl space-y-3 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                <FaBolt size={14} />
              </div>
              <h3 className="text-sm font-bold text-foreground">AI Included Packs</h3>
              <p className="text-xs text-muted leading-relaxed">
                Zero API configuration. Instant high-performance GPU access paid via Stripe or PayPal with automated credit refills.
              </p>
            </div>

            <div className="p-6 bg-glass-bg border border-glass-border rounded-2xl space-y-3 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                <FaKey size={14} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Bring Your Own Key</h3>
              <p className="text-xs text-muted leading-relaxed">
                Plug in your personal Fal.ai or MuAPI token. Pay upstream wholesale rates directly and use the full MaxMotion studio for $0 platform credits.
              </p>
            </div>

            <div className="p-6 bg-glass-bg border border-glass-border rounded-2xl space-y-3 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold">
                <FaCloud size={14} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Permanent Cloud Storage</h3>
              <p className="text-xs text-muted leading-relaxed">
                Every video is automatically mirrored to Google Cloud Storage. Your generation links and gallery previews never expire.
              </p>
            </div>

            <div className="p-6 bg-glass-bg border border-glass-border rounded-2xl space-y-3 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center font-bold">
                <FaShareAlt size={14} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Public Video Showcase</h3>
              <p className="text-xs text-muted leading-relaxed">
                Shareable links (`/v/[id]`) with native inline Twitter, Discord, and iMessage video player embeds, plus 1-click remixing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-20 px-4 text-center border-t border-glass-border bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground">
            Ready to direct your next scene?
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Launch the studio now and experience the creative power of multi-model generative AI.
          </p>
          <div className="pt-2">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-black font-black text-xs sm:text-sm tracking-wide uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(251,191,36,0.45)] border border-amber-200"
            >
              <span>Open Studio Workspace</span>
              <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
