"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FaCopy,
  FaCheck,
  FaKey,
  FaExternalLinkAlt,
  FaRobot,
  FaTerminal,
  FaCode,
  FaPlay,
} from "react-icons/fa";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function MCPConnectPage() {
  const { data: session } = useSession();
  const [activePlatform, setActivePlatform] = useState("claude");
  const [mcpUrl, setMcpUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMcpUrl(`${window.location.origin}/api/mcp`);
    }

    if (session?.user?.id) {
      fetch("/api/user/api-key")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.apiKey) setUserApiKey(data.apiKey);
        })
        .catch((e) => console.error(e));
    }
  }, [session]);

  const handleCopyUrl = () => {
    if (!mcpUrl) return;
    const finalUrl = userApiKey ? `${mcpUrl}?key=${userApiKey}` : mcpUrl;
    navigator.clipboard.writeText(finalUrl);
    setCopiedUrl(true);
    toast.success("MCP Connector URL copied!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    if (!userApiKey) return;
    navigator.clipboard.writeText(userApiKey);
    setCopiedKey(true);
    toast.success("API Key copied!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateKey = async () => {
    try {
      setGeneratingKey(true);
      const res = await fetch("/api/user/api-key", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setUserApiKey(data.apiKey);
        toast.success("New MaxMotion API Key generated!");
      } else {
        toast.error(data.error || "Failed to generate key");
      }
    } catch (e) {
      toast.error("Error generating key");
    } finally {
      setGeneratingKey(false);
    }
  };

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col bg-bg-page text-foreground">
      {/* 1. HERO SECTION (Artlist style) */}
      <section className="relative pt-20 pb-16 px-4 text-center max-w-4xl mx-auto space-y-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-3 flex-wrap">
          <span>MaxMotion is now inside</span>
          <span className="inline-flex items-center gap-2 text-amber-300">
            <span className="text-2xl sm:text-4xl">✳</span>
            <span>Claude</span>
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto leading-relaxed">
          Connect MaxMotion and direct cinema-grade video across 5 world-class AI engines — without ever leaving your conversation.
        </p>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={handleCopyUrl}
            className="px-8 py-3.5 rounded-full bg-glass-hover hover:bg-glass-bg border border-glass-border text-foreground font-bold text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <span>Connect MCP</span>
            <FaExternalLinkAlt size={10} className="text-amber-400" />
          </button>
        </div>

        {/* Platform Selector Strip */}
        <div className="pt-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setActivePlatform("claude")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activePlatform === "claude"
                ? "bg-amber-400/20 border border-amber-400/50 text-amber-300 shadow"
                : "bg-glass-bg border border-glass-border text-muted hover:text-foreground"
            }`}
          >
            <span>✳</span>
            <span>Claude</span>
          </button>

          <button
            onClick={() => setActivePlatform("cursor")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activePlatform === "cursor"
                ? "bg-blue-400/20 border border-blue-400/50 text-blue-300 shadow"
                : "bg-glass-bg border border-glass-border text-muted hover:text-foreground"
            }`}
          >
            <FaCode size={12} />
            <span>Cursor / VS Code</span>
          </button>

          <button
            onClick={() => setActivePlatform("chatgpt")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
              activePlatform === "chatgpt"
                ? "bg-emerald-400/20 border border-emerald-400/50 text-emerald-300 shadow"
                : "bg-glass-bg border border-glass-border text-muted hover:text-foreground"
            }`}
          >
            <FaRobot size={12} />
            <span>ChatGPT / Custom GPT</span>
          </button>
        </div>
      </section>

      {/* 2. THREE-STEP CONNECT BOX (Artlist style) */}
      <section className="max-w-4xl mx-auto w-full px-4 pb-20 space-y-8">
        <div className="bg-glass-bg border border-glass-border rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-glass-border pb-4">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Connect MCP to {activePlatform === "claude" ? "Claude" : activePlatform === "cursor" ? "Cursor" : "ChatGPT"}
            </h2>
            <button
              onClick={handleCopyUrl}
              className="px-4 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-black hover:bg-amber-300 transition-all flex items-center gap-1.5 shadow"
            >
              <FaCopy size={11} />
              <span>{copiedUrl ? "Copied!" : "Copy MCP Link"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                01 Copy the MCP URL
              </span>
              <div className="p-3 bg-black/40 border border-glass-border rounded-xl space-y-2">
                <p className="text-[11px] font-mono text-muted truncate">
                  {mcpUrl ? (userApiKey ? `${mcpUrl}?key=${userApiKey.slice(0, 10)}...` : mcpUrl) : "https://maxmotion.ai/api/mcp"}
                </p>
                <button
                  onClick={handleCopyUrl}
                  className="w-full py-1.5 bg-glass-hover hover:bg-glass-bg border border-glass-border rounded text-[10px] font-bold text-foreground flex items-center justify-center gap-1.5"
                >
                  {copiedUrl ? <FaCheck size={10} className="text-emerald-400" /> : <FaCopy size={10} />}
                  <span>{copiedUrl ? "Copied" : "Copy URL"}</span>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                02 Go to {activePlatform === "claude" ? "Claude Settings" : "Cursor Settings"}
              </span>
              <p className="text-xs text-muted leading-relaxed">
                {activePlatform === "claude" && (
                  <>Open Claude $\to$ <strong>Settings</strong> $\to$ <strong>Connectors</strong> $\to$ Add custom connector. Name it <strong>MaxMotion</strong> and paste the URL.</>
                )}
                {activePlatform === "cursor" && (
                  <>Open Cursor $\to$ <strong>Settings</strong> $\to$ <strong>Features</strong> $\to$ <strong>MCP Servers</strong> $\to$ Add New MCP Server with the URL above.</>
                )}
                {activePlatform === "chatgpt" && (
                  <>Open Custom GPT Editor $\to$ <strong>Actions</strong> $\to$ Import OpenAPI schema from your MaxMotion URL.</>
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                03 Connect and Authorize
              </span>
              <p className="text-xs text-muted leading-relaxed">
                {session?.user ? (
                  <>Use your MaxMotion API key below to authorize your account. All generations will automatically use your credit balance or BYOK token.</>
                ) : (
                  <>Sign in to your MaxMotion account to generate your personal key and connect your account credits.</>
                )}
              </p>
            </div>
          </div>

          {/* User API Key Manager Card */}
          <div className="pt-4 border-t border-glass-border">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <FaKey size={10} /> Your MaxMotion API Key
                </span>
                {session?.user ? (
                  userApiKey ? (
                    <p className="text-xs font-mono text-foreground font-bold">
                      {userApiKey.slice(0, 16)}••••••••••••••••
                    </p>
                  ) : (
                    <p className="text-xs text-muted">
                      No API key generated yet. Click generate to create your personal keycard.
                    </p>
                  )
                ) : (
                  <p className="text-xs text-muted">
                    Please <Link href="/login" className="text-primary underline">Sign In</Link> to view or generate your personal API key.
                  </p>
                )}
              </div>

              {session?.user && (
                <div className="flex items-center gap-2">
                  {userApiKey && (
                    <button
                      onClick={handleCopyKey}
                      className="px-3.5 py-1.5 bg-glass-hover hover:bg-glass-bg border border-glass-border text-foreground rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      {copiedKey ? <FaCheck size={10} className="text-emerald-400" /> : <FaCopy size={10} />}
                      <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                    </button>
                  )}
                  <button
                    onClick={handleGenerateKey}
                    disabled={generatingKey}
                    className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all shadow disabled:opacity-40"
                  >
                    {generatingKey ? "Generating..." : userApiKey ? "Regenerate Key" : "Generate Key"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. EXAMPLE PROMPTS TO TRY IN CLAUDE */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Try these prompts once connected to Claude:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-glass-bg border border-glass-border rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-amber-300">Sci-Fi Storyboard</span>
              <p className="text-xs text-foreground italic">
                &ldquo;Claude, write a short 2-scene teaser script and call MaxMotion generate_video with Wan 2.1 to direct scene 1 with 35mm rain reflections.&rdquo;
              </p>
            </div>

            <div className="p-4 bg-glass-bg border border-glass-border rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-blue-300">Human Action & Physics</span>
              <p className="text-xs text-foreground italic">
                &ldquo;Claude, use MaxMotion generate_video with Kling 1.5 Pro to generate a photorealistic scene of a dancer in fluid slow-motion in 16:9.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
