"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaKey,
  FaSlidersH,
  FaBell,
  FaCheckCircle,
  FaShieldAlt,
  FaBolt,
  FaInfoCircle,
  FaDownload,
  FaTrash,
  FaTerminal,
  FaCopy,
  FaCheck,
  FaVolumeUp,
  FaVideo,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingKey, setTestingKey] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [byokApiKey, setByokApiKey] = useState("");
  const [byokFalKey, setByokFalKey] = useState("");
  const [byokGeminiKey, setByokGeminiKey] = useState("");
  const [byokElevenLabsKey, setByokElevenLabsKey] = useState("");
  const [byokEnabled, setByokEnabled] = useState(false);
  const [testingFalKey, setTestingFalKey] = useState(false);
  const [testingGeminiKey, setTestingGeminiKey] = useState(false);
  const [testingElevenLabsKey, setTestingElevenLabsKey] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [generatingApiKey, setGeneratingApiKey] = useState(false);
  const [preferences, setPreferences] = useState({
    defaultModel: "wan-2.1",
    defaultAspectRatio: "16:9",
    defaultResolution: "720p",
    defaultCameraMotion: "auto",
    autoGenerateAudio: false,
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // GDPR state
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDownloadData = () => {
    window.location.href = "/api/user/gdpr/export";
    toast.success("Preparing your data archive for download...");
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== "DELETE_MY_ACCOUNT") {
      toast.error('Please type "DELETE_MY_ACCOUNT" to confirm');
      return;
    }
    try {
      setDeletingAccount(true);
      const res = await fetch("/api/user/gdpr/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE_MY_ACCOUNT" }),
      });
      if (res.ok) {
        toast.success("Account and data permanently deleted.");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to delete account");
      }
    } catch (e) {
      toast.error("Error deleting account");
    } finally {
      setDeletingAccount(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
      fetchNotifications();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        setName(data.name || "");
        setByokEnabled(Boolean(data.byokEnabled));
        if (data.apiKey) setUserApiKey(data.apiKey);
        if (data.preferences) {
          setPreferences((prev) => ({ ...prev, ...data.preferences }));
        }
      }
    } catch (e) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          byokEnabled,
          byokApiKey: byokApiKey.trim() || undefined,
          byokFalKey: byokFalKey.trim() || undefined,
          byokGeminiKey: byokGeminiKey.trim() || undefined,
          byokElevenLabsKey: byokElevenLabsKey.trim() || undefined,
          preferences,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success("Settings saved successfully!");
      setByokApiKey("");
      setByokFalKey("");
      setByokGeminiKey("");
      setByokElevenLabsKey("");
      fetchProfile();
      if (update) update();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestByokKey = async () => {
    if (!byokApiKey.trim()) {
      toast.error("Please enter a MuAPI key to test");
      return;
    }

    try {
      setTestingKey(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_byok_key",
          byokApiKey: byokApiKey.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Key verified successfully!");
      } else {
        toast.error(data.error || "Invalid API key");
      }
    } catch (e) {
      toast.error("Verification failed");
    } finally {
      setTestingKey(false);
    }
  };

  const handleTestFalKey = async () => {
    if (!byokFalKey.trim()) {
      toast.error("Please enter a Fal.ai key to test");
      return;
    }

    try {
      setTestingFalKey(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_byok_fal_key",
          byokFalKey: byokFalKey.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Fal.ai key verified successfully!");
      } else {
        toast.error(data.error || "Invalid Fal.ai key");
      }
    } catch (e) {
      toast.error("Verification failed");
    } finally {
      setTestingFalKey(false);
    }
  };

  const handleTestGeminiKey = async () => {
    if (!byokGeminiKey.trim()) {
      toast.error("Please enter a Google Gemini API key to test");
      return;
    }

    try {
      setTestingGeminiKey(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_byok_gemini_key",
          byokGeminiKey: byokGeminiKey.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Google Gemini Flash key verified!");
      } else {
        toast.error(data.error || "Invalid Gemini API key");
      }
    } catch (e) {
      toast.error("Verification failed");
    } finally {
      setTestingGeminiKey(false);
    }
  };

  const handleTestElevenLabsKey = async () => {
    if (!byokElevenLabsKey.trim()) {
      toast.error("Please enter an ElevenLabs API key to test");
      return;
    }

    try {
      setTestingElevenLabsKey(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_byok_elevenlabs_key",
          byokElevenLabsKey: byokElevenLabsKey.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "ElevenLabs key verified successfully!");
      } else {
        toast.error(data.error || "Invalid ElevenLabs API key");
      }
    } catch (e) {
      toast.error("Verification failed");
    } finally {
      setTestingElevenLabsKey(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      setGeneratingApiKey(true);
      const res = await fetch("/api/user/api-key", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setUserApiKey(data.apiKey);
        toast.success("New API key generated!");
      } else {
        toast.error(data.error || "Failed to generate key");
      }
    } catch (e) {
      toast.error("Error generating key");
    } finally {
      setGeneratingApiKey(false);
    }
  };

  const handleCopyApiKey = () => {
    if (!userApiKey) return;
    navigator.clipboard.writeText(userApiKey);
    setCopiedApiKey(true);
    toast.success("API key copied!");
  };

  const handleMarkAsRead = async (msgId) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === msgId ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
          User Settings & Preferences
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage your account profile, Bring-Your-Own-Key (BYOK) configurations, and notification preferences.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-glass-border pb-3 mb-8">
        {[
          { id: "profile", label: "Profile", icon: FaUser },
          { id: "byok", label: "BYOK Engine", icon: FaKey },
          { id: "preferences", label: "Studio Defaults", icon: FaSlidersH },
          { id: "mcp", label: "Developer & MCP", icon: FaTerminal },
          {
            id: "notifications",
            label: "Inbox & Announcements",
            icon: FaBell,
            badge: notifications.filter((n) => !n.isRead).length,
          },
          { id: "gdpr", label: "Privacy & GDPR", icon: FaShieldAlt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-glass-bg border border-glass-border text-muted hover:text-foreground hover:bg-glass-hover"
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === "profile" && (
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-6 max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <FaUser className="text-primary" /> Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={profile?.email || ""}
                className="w-full px-3 py-2 bg-glass-hover/50 border border-glass-border rounded-md text-xs text-muted cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-glass-hover/50 rounded-lg border border-glass-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                  Credit Balance
                </span>
                <span className="text-xl font-black text-primary">
                  {profile?.credits || 0} Credits
                </span>
              </div>

              <div className="p-3 bg-glass-hover/50 rounded-lg border border-glass-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                  Account Role
                </span>
                <span className="text-sm font-black text-foreground capitalize">
                  {profile?.role || "User"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      )}

      {/* Tab 2: BYOK Engine */}
      {activeTab === "byok" && (
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-6 max-w-2xl">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <FaKey className="text-primary" /> Bring Your Own Key (BYOK) Engine
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              When BYOK is enabled, the platform will use your personal MuAPI / Seedance key.{" "}
              <strong className="text-emerald-400">0 platform credits are deducted</strong> on generations.
            </p>
          </div>

          {/* Toggle BYOK Switch */}
          <div className="flex items-center justify-between p-4 bg-glass-hover/60 border border-glass-border rounded-lg">
            <div>
              <p className="text-xs font-bold text-foreground">Enable BYOK Mode</p>
              <p className="text-[10px] text-muted">Bypass credit system and bill directly to your API key</p>
            </div>
            <button
              onClick={() => setByokEnabled(!byokEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                byokEnabled ? "bg-emerald-500" : "bg-divider"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  byokEnabled ? "translate-x-6.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* MuAPI Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Seedance / MuAPI Master Key
              </label>
              <span className="text-[9px] text-primary font-medium">For Seedance 2.0 & Mini</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={byokApiKey}
                onChange={(e) => setByokApiKey(e.target.value)}
                placeholder={profile?.hasByokKey ? profile.maskedByokKey : "Enter your MuAPI Key (e.g. sk_...)"}
                className="flex-1 px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
              <button
                onClick={handleTestByokKey}
                disabled={testingKey || !byokApiKey.trim()}
                className="px-4 py-2 bg-glass-hover border border-glass-border rounded-md text-xs font-bold text-foreground hover:bg-glass-bg transition-colors disabled:opacity-50"
              >
                {testingKey ? "Testing..." : "Test Key"}
              </button>
            </div>
            {profile?.hasByokKey && (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <FaCheckCircle size={10} /> Active ({profile.maskedByokKey}). Enter a new key to update.
              </p>
            )}
          </div>

          {/* Fal.ai Key Input */}
          <div className="space-y-2 pt-2 border-t border-glass-border">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Fal.ai API Key
              </label>
              <span className="text-[9px] text-amber-400 font-medium">For Wan 2.1, Kling 1.5, & Minimax</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={byokFalKey}
                onChange={(e) => setByokFalKey(e.target.value)}
                placeholder={profile?.hasByokFalKey ? profile.maskedByokFalKey : "Enter your Fal.ai Key (Key ...)"}
                className="flex-1 px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
              <button
                onClick={handleTestFalKey}
                disabled={testingFalKey || !byokFalKey.trim()}
                className="px-4 py-2 bg-glass-hover border border-glass-border rounded-md text-xs font-bold text-foreground hover:bg-glass-bg transition-colors disabled:opacity-50"
              >
                {testingFalKey ? "Testing..." : "Test Fal Key"}
              </button>
            </div>
            {profile?.hasByokFalKey && (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <FaCheckCircle size={10} /> Active ({profile.maskedByokFalKey}). Enter a new key to update.
              </p>
            )}
          </div>

          {/* Google Gemini Flash Key Input */}
          <div className="space-y-2 pt-2 border-t border-glass-border">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                Google Gemini Flash API Key
              </label>
              <span className="text-[9px] text-blue-400 font-medium">For AI Studio Director & Vision Enhancer</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={byokGeminiKey}
                onChange={(e) => setByokGeminiKey(e.target.value)}
                placeholder={profile?.hasByokGeminiKey ? profile.maskedByokGeminiKey : "Enter Google Gemini API Key (AIzaSy...)"}
                className="flex-1 px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
              <button
                onClick={handleTestGeminiKey}
                disabled={testingGeminiKey || !byokGeminiKey.trim()}
                className="px-4 py-2 bg-glass-hover border border-glass-border rounded-md text-xs font-bold text-foreground hover:bg-glass-bg transition-colors disabled:opacity-50"
              >
                {testingGeminiKey ? "Testing..." : "Test Gemini"}
              </button>
            </div>
            {profile?.hasByokGeminiKey ? (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <FaCheckCircle size={10} /> Active ({profile.maskedByokGeminiKey}). Enter a new key to update.
              </p>
            ) : (
              <p className="text-[10px] text-muted">
                Free personal API keys are available from Google AI Studio. Powers real-time director advice and vision-to-prompt analysis.
              </p>
            )}
          </div>

          {/* ElevenLabs Key Input */}
          <div className="space-y-2 pt-2 border-t border-glass-border">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                ElevenLabs API Key
              </label>
              <span className="text-[9px] text-purple-400 font-medium">For AI Voiceovers, Narration & Dubbing</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={byokElevenLabsKey}
                onChange={(e) => setByokElevenLabsKey(e.target.value)}
                placeholder={profile?.hasByokElevenLabsKey ? profile.maskedByokElevenLabsKey : "Enter ElevenLabs API Key (sk_...)"}
                className="flex-1 px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary font-mono"
              />
              <button
                onClick={handleTestElevenLabsKey}
                disabled={testingElevenLabsKey || !byokElevenLabsKey.trim()}
                className="px-4 py-2 bg-glass-hover border border-glass-border rounded-md text-xs font-bold text-foreground hover:bg-glass-bg transition-colors disabled:opacity-50"
              >
                {testingElevenLabsKey ? "Testing..." : "Test Voice Key"}
              </button>
            </div>
            {profile?.hasByokElevenLabsKey ? (
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <FaCheckCircle size={10} /> Active ({profile.maskedByokElevenLabsKey}). Enter a new key to update.
              </p>
            ) : (
              <p className="text-[10px] text-muted">
                Powers lifelike multi-character speech and cinematic voiceovers with 0 platform fees.
              </p>
            )}
          </div>

          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-secondary-text space-y-1">
            <p className="font-bold text-primary flex items-center gap-1">
              <FaShieldAlt size={12} /> Privacy & Security Note
            </p>
            <p className="text-[11px] leading-relaxed">
              Your API keys are transmitted over TLS and stored securely in Google Cloud Firestore. They are only decrypted server-side to sign generation requests on your behalf.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
          >
            {saving ? "Saving..." : "Save BYOK Settings"}
          </button>
        </div>
      )}

      {/* Tab 3: Studio Preferences */}
      {activeTab === "preferences" && (
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-6 max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <FaSlidersH className="text-primary" /> Default Studio Preferences
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                Default AI Model
              </label>
              <select
                value={preferences.defaultModel}
                onChange={(e) =>
                  setPreferences({ ...preferences, defaultModel: e.target.value })
                }
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="wan-2.1">Wan 2.1 (Alibaba 14B Cinema • SOTA)</option>
                <option value="kling-1.5">Kling 1.5 Pro (Extreme Motion Physics)</option>
                <option value="minimax">Minimax Hailuo (Photorealistic Faces)</option>
                <option value="seedance-2.0">Seedance 2.0 (High Definition)</option>
                <option value="seedance-mini">Seedance 2 Mini (Fast, 50% Off)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                Default Aspect Ratio
              </label>
              <select
                value={preferences.defaultAspectRatio}
                onChange={(e) =>
                  setPreferences({ ...preferences, defaultAspectRatio: e.target.value })
                }
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="16:9">16:9 Cinema Landscape</option>
                <option value="9:16">9:16 TikTok / Reel Vertical</option>
                <option value="4:3">4:3 Standard</option>
                <option value="3:4">3:4 Portrait</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                Default Camera Motion Direction
              </label>
              <select
                value={preferences.defaultCameraMotion || "auto"}
                onChange={(e) =>
                  setPreferences({ ...preferences, defaultCameraMotion: e.target.value })
                }
                className="w-full px-3 py-2 bg-glass-hover border border-glass-border rounded-md text-xs text-foreground outline-none focus:border-primary capitalize"
              >
                {["auto", "pan_left", "pan_right", "tilt_up", "tilt_down", "zoom_in", "zoom_out", "orbit", "static"].map((dir) => (
                  <option key={dir} value={dir}>
                    {dir.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-Generate Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-glass-hover border border-glass-border rounded-xl">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Auto-Synthesize Sound Effects & Ambience
                </span>
                <span className="text-[10px] text-muted block">
                  Automatically generate synchronized atmospheric audio alongside videos
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    autoGenerateAudio: !preferences.autoGenerateAudio,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  preferences.autoGenerateAudio ? "bg-amber-500" : "bg-divider"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    preferences.autoGenerateAudio ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      )}

      {/* Tab 4: Developer & MCP */}
      {activeTab === "mcp" && (
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <FaTerminal className="text-amber-400" /> MaxMotion API & Model Context Protocol (MCP)
            </h2>
            <a
              href="/mcp"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Setup Guide →
            </a>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Use your personal MaxMotion API Key to authenticate external connectors like Claude Desktop, Cursor, VS Code, or custom backend scripts.
          </p>

          <div className="p-4 bg-glass-hover/70 border border-glass-border rounded-xl space-y-3">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">
              Personal API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={userApiKey || "No key generated yet"}
                className="flex-1 px-3 py-2 bg-bg-page border border-glass-border rounded-lg text-xs font-mono text-amber-300 select-all"
              />
              {userApiKey && (
                <button
                  onClick={handleCopyApiKey}
                  className="px-4 py-2 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-lg text-xs font-bold text-foreground flex items-center gap-1.5 transition-colors"
                >
                  {copiedApiKey ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                  <span>{copiedApiKey ? "Copied" : "Copy"}</span>
                </button>
              )}
              <button
                onClick={handleGenerateApiKey}
                disabled={generatingApiKey}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                {generatingApiKey ? "Generating..." : userApiKey ? "Rotate Key" : "Generate Key"}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-glass-hover/40 border border-glass-border space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground block">
              Your MCP Server URL
            </span>
            <div className="p-2.5 bg-bg-page rounded-lg border border-glass-border flex items-center justify-between text-xs font-mono text-muted">
              <span>{typeof window !== "undefined" ? `${window.location.origin}/api/mcp` : "https://maxmotion.ai/api/mcp"}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/mcp`);
                  toast.success("MCP URL copied!");
                }}
                className="text-primary hover:text-primary-hover font-sans text-xs font-bold"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications & Inbox */}
      {activeTab === "notifications" && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <FaBell className="text-primary" /> Notifications & Announcements
            </h2>
            <span className="text-[10px] text-muted font-bold">
              {notifications.length} Total Messages
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="p-12 text-center bg-glass-bg border border-glass-border rounded-xl">
              <FaInfoCircle className="mx-auto text-muted text-2xl mb-2" />
              <p className="text-xs text-muted">No announcements or messages yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-xl border transition-all ${
                    msg.isRead
                      ? "bg-glass-bg/40 border-glass-border/40 opacity-75"
                      : "bg-glass-bg border-primary/50 shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            msg.type === "warning"
                              ? "bg-amber-500/20 text-amber-300"
                              : msg.type === "promo"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          {msg.type}
                        </span>
                        <h3 className="text-sm font-bold text-foreground">{msg.title}</h3>
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-secondary-text leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                      <p className="text-[10px] text-muted pt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!msg.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(msg.id)}
                        className="px-3 py-1 bg-glass-hover text-foreground hover:bg-glass-bg border border-glass-border text-[10px] font-bold rounded"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Privacy & GDPR */}
      {activeTab === "gdpr" && (
        <div className="space-y-6">
          {/* Data Portability */}
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 space-y-4 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FaDownload className="text-primary" size={13} />
                  <span>Download Your Data Archive (GDPR Article 20)</span>
                </h3>
                <p className="text-xs text-muted mt-1 max-w-xl leading-relaxed">
                  Export all your personal data, complete creation history, video generation metadata, and billing logs in standardized JSON format.
                </p>
              </div>

              <button
                onClick={handleDownloadData}
                className="px-4 py-2.5 bg-glass-hover hover:bg-glass-bg border border-glass-border rounded-xl text-xs font-bold text-foreground transition-all flex items-center gap-2 shrink-0 shadow"
              >
                <FaDownload size={11} className="text-primary" />
                <span>Export Data (.json)</span>
              </button>
            </div>
          </div>

          {/* Right to Erasure */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-4 shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <FaTrash size={13} />
                <span>Permanent Account Deletion (GDPR Article 17)</span>
              </h3>
              <p className="text-xs text-muted mt-1 max-w-xl leading-relaxed">
                Permanently delete your account profile, all generated video files, credit records, and associated data. This action is irreversible.
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-3 pt-2">
              <label className="text-[11px] text-muted block">
                Type <strong className="text-red-400 font-mono">DELETE_MY_ACCOUNT</strong> below to confirm:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE_MY_ACCOUNT"
                  className="flex-1 px-3 py-2 bg-black/40 border border-red-500/30 rounded-xl text-xs text-foreground outline-none focus:border-red-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={deletingAccount || deleteConfirmText !== "DELETE_MY_ACCOUNT"}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 shadow-lg shadow-red-900/20"
                >
                  {deletingAccount ? "Erasing..." : "Permanently Delete Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
