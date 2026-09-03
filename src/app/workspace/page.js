"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import {
  FaBolt,
  FaMagic,
  FaChevronDown,
  FaPlus,
  FaTrash,
  FaSyncAlt,
  FaVideo,
  FaMusic,
  FaLightbulb,
  FaShareAlt,
  FaCopy,
  FaCode,
  FaCheck,
  FaCompass,
} from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import { FiDownload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { downloadMedia } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import Tooltip from "@/components/Tooltip";
import AIOptimizer from "@/lib/services/ai-optimizer";

const ASPECT_RATIOS = [
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "4:3", value: "4:3" },
  { label: "3:4", value: "3:4" },
];

const RESOLUTIONS = [
  { value: "480p", label: "480p" },
  { value: "720p", label: "720p" },
];

const DURATIONS = [
  { value: 5, label: "5 Seconds" },
  { value: 10, label: "10 Seconds" },
  { value: 15, label: "15 Seconds" },
];

const QUALITIES = [
  { value: "basic", label: "Basic" },
  { value: "high", label: "High" },
];

const CAMERA_MOTIONS = [
  { value: "auto", label: "Auto / Dynamic" },
  { value: "pan_left", label: "Pan Left" },
  { value: "pan_right", label: "Pan Right" },
  { value: "tilt_up", label: "Tilt Up" },
  { value: "tilt_down", label: "Tilt Down" },
  { value: "zoom_in", label: "Zoom In" },
  { value: "zoom_out", label: "Zoom Out" },
  { value: "orbit", label: "Cinematic Orbit" },
  { value: "static", label: "Static Tripod" },
];

function CustomSelect({ label, value, options, onChange, icon: Icon, tooltip }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
          {label}
        </label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <span className="text-[9px] text-muted hover:text-primary cursor-pointer">ⓘ</span>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-glass-bg border border-glass-border rounded-md text-xs font-medium text-foreground hover:bg-glass-hover transition-colors outline-none"
        >
          <div className="flex items-center gap-2 truncate">
            {Icon && <Icon className="text-primary text-[10px] shrink-0" />}
            <span className="truncate">{selectedOption.label}</span>
          </div>
          <FaChevronDown
            className={`text-[10px] text-muted transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute bottom-10 left-0 right-0 bg-glass-bg border border-glass-border rounded-md shadow-xl z-[100] overflow-hidden backdrop-blur-xl max-h-48 overflow-y-auto custom-scrollbar"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    value === option.value
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-glass-hover hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  // Mode & Model State
  const [mode, setMode] = useState("text-to-video");
  const [model, setModel] = useState("seedance-2.0");

  // Form State
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  const [resolution, setResolution] = useState(RESOLUTIONS[1].value); // 720p default
  const [duration, setDuration] = useState(DURATIONS[0].value);
  const [quality, setQuality] = useState(QUALITIES[0].value);
  const [cameraMotion, setCameraMotion] = useState(CAMERA_MOTIONS[0].value);
  const [imagesList, setImagesList] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newAudioUrl, setNewAudioUrl] = useState("");
  const [autoAudio, setAutoAudio] = useState(false);

  // Dynamic Settings & Templates
  const [appName, setAppName] = useState("MaxMotion AI");
  const [templates, setTemplates] = useState([]);

  // UI State
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [currentCreationId, setCurrentCreationId] = useState(null);
  const [error, setError] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Load public settings and URL remix parameters on mount
  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.appName) setAppName(data.appName);
        if (data?.templates) setTemplates(data.templates);
      })
      .catch((err) => console.error(err));

    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      if (search.get("prompt")) setPrompt(search.get("prompt"));
      if (search.get("model")) setModel(search.get("model"));
      if (search.get("aspectRatio")) setAspectRatio(search.get("aspectRatio"));
      if (search.get("resolution")) setResolution(search.get("resolution"));
    }
  }, []);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    try {
      setIsEnhancing(true);
      const res = await fetch("/api/ai/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast.success("Prompt enhanced with cinematic specs!");
      }
    } catch (e) {
      console.error("Enhance prompt error:", e);
      toast.error("Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  const MODES = [
    { id: "text-to-video", label: "Text", fullLabel: "Text to Video", icon: FaBolt },
    { id: "image-to-video", label: "Image", fullLabel: "Image to Video", icon: IoImageOutline },
    { id: "reference-to-video", label: "Reference", fullLabel: "Reference to Video", icon: FaSyncAlt },
  ];

  const addImageToList = () => {
    if (newImageUrl && imagesList.length < 9) {
      setImagesList([...imagesList, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!session) {
      signIn();
      return;
    }

    if (imagesList.length >= 9) {
      setError("Maximum 9 images allowed");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to upload image");
      }

      const data = await response.json();
      setImagesList([...imagesList, data.url]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileUploadVideo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!session) {
      signIn();
      return;
    }

    if (videoFiles.length >= 3) {
      setError("Maximum 3 videos allowed");
      return;
    }

    setIsUploadingVideo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to upload video");
      }

      const data = await response.json();
      setVideoFiles([...videoFiles, data.url]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload video. Please try again.");
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  const handleFileUploadAudio = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!session) {
      signIn();
      return;
    }

    if (audioFiles.length >= 3) {
      setError("Maximum 3 audio clips allowed");
      return;
    }

    setIsUploadingAudio(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to upload audio");
      }

      const data = await response.json();
      setAudioFiles([...audioFiles, data.url]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload audio. Please try again.");
    } finally {
      setIsUploadingAudio(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  };

  const handleGenerate = async () => {
    if (!session) {
      signIn();
      return;
    }

    setLoading(true);
    setError(null);
    setResultUrl(null);
    setCurrentCreationId(null);
    setStatusMessage("Submitting to GPU inference cluster...");

    try {
      // Sanitize and append camera motion directive
      let finalPrompt = AIOptimizer.sanitizePrompt(prompt);
      if (cameraMotion && cameraMotion !== "auto" && !finalPrompt.toLowerCase().includes("camera")) {
        const motionLabel = cameraMotion.replace("_", " ");
        finalPrompt = `${finalPrompt}, ${motionLabel} camera movement`;
      }

      const payload = {
        mode,
        prompt: finalPrompt,
        aspect_ratio: aspectRatio,
        resolution,
        duration,
        quality,
        model,
      };

      if (mode === "image-to-video") {
        if (imagesList.length === 0) {
          throw new Error("Please provide at least 1 image for image-to-video generation");
        }
        payload.images_list = imagesList;
      } else if (mode === "reference-to-video") {
        if (imagesList.length === 0 && videoFiles.length === 0 && audioFiles.length === 0) {
          throw new Error("Please provide at least one image, video, or audio reference");
        }
        payload.images_list = imagesList;
        payload.video_files = videoFiles;
        payload.audio_files = audioFiles;
      }

      const response = await fetch("/api/seedance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          router.push("/pricing");
          throw new Error("Insufficient credits. Redirecting to pricing...");
        }
        throw new Error(errorData.error || "Failed to submit request");
      }

      const data = await response.json();
      const requestId = data.request_id;
      setCurrentCreationId(requestId);
      setStatusMessage("Synthesizing cinematic frames...");

      pollStatus(requestId);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error(err.message);
    }
  };

  const pollStatus = async (requestId) => {
    const startTime = Date.now();
    const timeout = 600000; // 10 minutes

    const check = async () => {
      try {
        if (Date.now() - startTime > timeout) {
          setError("Generation timed out. If credits were deducted, they have been automatically restored.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/seedance/check-status?requestId=${requestId}`);
        if (!res.ok) throw new Error("Failed to check status");

        const data = await res.json();

        if (data.status === "completed") {
          setResultUrl(data.imageUrl);
          setLoading(false);
          toast.success("Generation completed!");

          if (autoAudio && data.creationId) {
            toast.success("Synthesizing Foley & sound effects...");
            fetch("/api/ai/audio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt,
                duration,
                creationId: data.creationId,
              }),
            })
              .then((r) => r.json())
              .then((aData) => {
                if (aData?.audioUrl) {
                  toast.success("Synchronized atmospheric sound synthesized!");
                }
              })
              .catch((e) => console.error("Auto audio failed:", e));
          }
        } else if (data.status === "failed") {
          setError(data.error || "Generation failed.");
          setLoading(false);
          toast.error(data.error || "Generation failed");
        } else {
          setStatusMessage("Rendering high-motion video frames...");
          setTimeout(check, 4000);
        }
      } catch (err) {
        console.error("Polling error:", err);
        setTimeout(check, 5000);
      }
    };

    check();
  };

  const getAvailableDurations = () => {
    if (mode === "reference-to-video") {
      return DURATIONS.filter((d) => d.value === 5 || d.value === 10);
    }
    return DURATIONS;
  };

  useEffect(() => {
    const available = getAvailableDurations();
    if (!available.find((d) => d.value === duration)) {
      setDuration(available[0].value);
    }
  }, [mode]);

  const creditCost = (() => {
    const isReference = mode === "reference-to-video";
    const is720p = resolution === "720p";
    let rate;

    if (model === "wan-2.1") {
      return Math.ceil(duration * 30);
    }
    if (model === "kling-1.5") {
      return Math.ceil(duration * 55);
    }
    if (model === "minimax") {
      return Math.ceil(duration * 50);
    }

    if (isReference) {
      if (is720p) {
        rate = quality === "high" ? 60 : 42;
      } else {
        rate = quality === "high" ? 48 : 36;
      }
    } else {
      if (is720p) {
        rate = quality === "high" ? 50 : 30;
      } else {
        rate = quality === "high" ? 30 : 24;
      }
    }
    if (model === "seedance-mini") {
      rate = Math.max(10, Math.round(rate * 0.5));
    }
    return Math.ceil(duration * rate);
  })();

  const publicShareUrl =
    typeof window !== "undefined" && currentCreationId
      ? `${window.location.origin}/v/${currentCreationId}`
      : "";

  const handleCopyLink = () => {
    if (!publicShareUrl) return;
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    if (!publicShareUrl) return;
    const embed = `<iframe src="${publicShareUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embed);
    setCopiedEmbed(true);
    toast.success("Embed iframe copied!");
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share && publicShareUrl) {
      try {
        await navigator.share({
          title: `${appName} Video`,
          text: prompt,
          url: publicShareUrl,
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <Toaster position="top-right" />

      {/* Playground Header */}
      <div className="max-w-6xl w-full mb-8 text-center space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black text-foreground tracking-tight uppercase"
        >
          {appName} Studio
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs md:text-sm text-muted max-w-2xl mx-auto leading-relaxed"
        >
          Transform text and media references into high-definition cinematic video using our multi-model AI inference engine.
        </motion.p>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Controls */}
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-glass-border">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FaMagic size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Video Generation Controls
              </h2>
              <p className="text-[10px] text-muted">Direct your scene parameters</p>
            </div>
          </div>

          {/* Model Selector Toggle with Tooltips */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
                AI Video Engine
              </label>
              <Tooltip content="Each AI engine has unique strengths in physics, character acting, or volumetric lighting.">
                <span className="text-[10px] text-muted hover:text-primary cursor-pointer">
                  Need guidance?
                </span>
              </Tooltip>
            </div>

            {/* Smart Engine Suggestion Banner */}
            {prompt.trim().length > 10 && (() => {
              const rec = AIOptimizer.recommendEngine(prompt, mode);
              if (rec && rec.engine !== model && rec.confidence >= 0.85) {
                return (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20 text-[10px] animate-fade-in">
                    <span className="text-secondary-text truncate mr-2">
                      💡 <strong>{rec.name}</strong> is optimal for this scene.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setModel(rec.engine);
                        toast.success(`Switched to ${rec.name}!`);
                      }}
                      className="px-2 py-0.5 bg-primary text-white rounded font-bold hover:bg-primary-hover transition-colors shrink-0"
                    >
                      Switch
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 p-1 bg-glass-hover rounded-md border border-glass-border">
              <Tooltip content="ByteDance flagship model for high-energy motion and action scenes.">
                <button
                  type="button"
                  onClick={() => setModel("seedance-2.0")}
                  className={`w-full py-1.5 rounded-md text-[11px] font-semibold transition-all flex flex-col items-center justify-center ${
                    model === "seedance-2.0"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>Seedance 2</span>
                  <span className="text-[8px] opacity-70">HD</span>
                </button>
              </Tooltip>

              <Tooltip content="Fast budget model with a 50% discount on credit consumption.">
                <button
                  type="button"
                  onClick={() => setModel("seedance-mini")}
                  className={`w-full py-1.5 rounded-md text-[11px] font-semibold transition-all flex flex-col items-center justify-center ${
                    model === "seedance-mini"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>Seedance Mini</span>
                  <span className="text-[8px] text-emerald-400 font-bold">50% Off</span>
                </button>
              </Tooltip>

              <Tooltip content="Alibaba 14B model known for remarkable cinematic lighting and scenery.">
                <button
                  type="button"
                  onClick={() => setModel("wan-2.1")}
                  className={`w-full py-1.5 rounded-md text-[11px] font-semibold transition-all flex flex-col items-center justify-center ${
                    model === "wan-2.1"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>Wan 2.1</span>
                  <span className="text-[8px] text-amber-300 font-bold">Alibaba</span>
                </button>
              </Tooltip>

              <Tooltip content="Leading engine for realistic human physical motion, walking, and anatomy.">
                <button
                  type="button"
                  onClick={() => setModel("kling-1.5")}
                  className={`w-full py-1.5 rounded-md text-[11px] font-semibold transition-all flex flex-col items-center justify-center ${
                    model === "kling-1.5"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>Kling 1.5</span>
                  <span className="text-[8px] text-blue-300 font-bold">Physics</span>
                </button>
              </Tooltip>

              <Tooltip content="Hailuo Video-01 benchmark for facial acting, emotion, and storytelling.">
                <button
                  type="button"
                  onClick={() => setModel("minimax")}
                  className={`w-full py-1.5 rounded-md text-[11px] font-semibold transition-all flex flex-col items-center justify-center ${
                    model === "minimax"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>Minimax</span>
                  <span className="text-[8px] text-purple-300 font-bold">Hailuo</span>
                </button>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-3 p-1 bg-glass-hover rounded-md border border-glass-border">
            {MODES.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    mode === m.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="shrink-0" />{" "}
                  <span className="sm:hidden">{m.label}</span>
                  <span className="hidden sm:inline">{m.fullLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Prompt Section */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
                  Prompt
                </label>
                <Tooltip content="Rewrites prompt into a cinematic 35mm composition tailored to the active engine using Gemini Flash">
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                    className="text-[10px] text-primary hover:text-primary-hover font-bold flex items-center gap-1 transition-colors disabled:opacity-40"
                  >
                    <FaMagic size={9} />
                    <span>{isEnhancing ? "Enhancing..." : "✨ Enhance with AI"}</span>
                  </button>
                </Tooltip>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === "reference-to-video"
                    ? "Use @image1, @video1, @audio1 to reference your files... \nExample: @video1 in the style of @image1 with @audio1"
                    : "Describe your video scene..."
                }
                className="w-full h-28 bg-glass-bg border border-glass-border rounded-md p-2.5 text-xs outline-none focus:border-primary/40 resize-none transition-colors custom-scrollbar"
              />

              {/* Dynamic Inspiration Templates */}
              {templates.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                    <FaLightbulb className="text-amber-400" size={9} /> Prompt Inspiration
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setPrompt(tpl.prompt);
                          if (tpl.model) setModel(tpl.model);
                          if (tpl.aspectRatio) setAspectRatio(tpl.aspectRatio);
                          toast.success(`Loaded "${tpl.title}" template!`);
                        }}
                        className="text-[10px] px-2 py-1 bg-glass-hover hover:bg-glass-bg border border-glass-border hover:border-primary/50 text-secondary-text hover:text-foreground rounded-md transition-all font-medium"
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {mode !== "text-to-video" && (
              <div className="space-y-3">
                <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
                  Images ({imagesList.length}/9)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Image URL..."
                    className="flex-1 bg-glass-bg border border-glass-border rounded-md px-3 py-2 text-xs outline-none focus:border-primary/40"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept=".png, .jpg, .jpeg"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => {
                      if (!session) {
                        signIn();
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading || imagesList.length >= 9}
                    className="w-9 h-9 bg-primary/10 border border-primary/20 text-primary rounded-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IoImageOutline />
                    )}
                  </button>
                  <button
                    onClick={addImageToList}
                    disabled={!newImageUrl || imagesList.length >= 9}
                    className="w-9 h-9 bg-glass-bg border border-glass-border text-primary rounded-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  >
                    <FaPlus />
                  </button>
                </div>
                {imagesList.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {imagesList.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-md bg-glass-bg overflow-hidden group border border-glass-border"
                      >
                        <img
                          src={url}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setImagesList(imagesList.filter((_, i) => i !== idx))
                          }
                          className="absolute top-2 right-2 p-1 rounded bg-red-500/80 items-center justify-center hidden group-hover:flex"
                        >
                          <FaTrash className="text-white text-[10px]" />
                        </button>
                        <div className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] text-white">
                          @image{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mode === "reference-to-video" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
                    Video References ({videoFiles.length}/3)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="Video URL..."
                      className="flex-1 bg-glass-bg border border-glass-border rounded-md px-3 py-2 text-xs outline-none focus:border-primary/40"
                    />
                    <input
                      type="file"
                      ref={videoInputRef}
                      hidden
                      accept=".mp4"
                      onChange={handleFileUploadVideo}
                    />
                    <button
                      onClick={() => {
                        if (!session) {
                          signIn();
                          return;
                        }
                        videoInputRef.current?.click();
                      }}
                      disabled={isUploadingVideo || videoFiles.length >= 3}
                      className="w-9 h-9 bg-primary/10 border border-primary/20 text-primary rounded-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                      {isUploadingVideo ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaVideo />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (newVideoUrl && videoFiles.length < 3) {
                          setVideoFiles([...videoFiles, newVideoUrl]);
                          setNewVideoUrl("");
                        }
                      }}
                      disabled={!newVideoUrl || videoFiles.length >= 3}
                      className="w-9 h-9 bg-glass-bg border border-glass-border text-primary rounded-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {videoFiles.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {videoFiles.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-md bg-glass-bg overflow-hidden group border border-glass-border"
                        >
                          <video
                            src={url}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() =>
                              setVideoFiles(
                                videoFiles.filter((_, i) => i !== idx),
                              )
                            }
                            className="absolute top-2 right-2 p-1 rounded bg-red-500/80 items-center justify-center hidden group-hover:flex"
                          >
                            <FaTrash className="text-white text-[10px]" />
                          </button>
                          <div className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] text-white">
                            @video{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-medium text-muted uppercase tracking-wider">
                    Audio Clips ({audioFiles.length}/3)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAudioUrl}
                      onChange={(e) => setNewAudioUrl(e.target.value)}
                      placeholder="Audio URL..."
                      className="flex-1 bg-glass-bg border border-glass-border rounded-md px-3 py-2 text-xs outline-none focus:border-primary/40"
                    />
                    <input
                      type="file"
                      ref={audioInputRef}
                      hidden
                      accept=".mp3,.wav"
                      onChange={handleFileUploadAudio}
                    />
                    <button
                      onClick={() => {
                        if (!session) {
                          signIn();
                          return;
                        }
                        audioInputRef.current?.click();
                      }}
                      disabled={isUploadingAudio || audioFiles.length >= 3}
                      className="w-9 h-9 bg-primary/10 border border-primary/20 text-primary rounded-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                      {isUploadingAudio ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaMusic />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (newAudioUrl && audioFiles.length < 3) {
                          setAudioFiles([...audioFiles, newAudioUrl]);
                          setNewAudioUrl("");
                        }
                      }}
                      disabled={!newAudioUrl || audioFiles.length >= 3}
                      className="w-9 h-9 bg-glass-bg border border-glass-border text-primary rounded-md flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  {audioFiles.length > 0 && (
                    <div className="space-y-2">
                      {audioFiles.map((url, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-md bg-glass-bg border border-glass-border group"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FaMusic className="text-muted text-[10px]" />
                            <span className="text-[10px] text-foreground truncate">
                              {url.split("/").pop()}
                            </span>
                            <span className="text-[8px] text-primary font-bold">
                              @audio{idx + 1}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setAudioFiles(
                                audioFiles.filter((_, i) => i !== idx),
                              )
                            }
                            className="text-muted hover:text-red-500"
                          >
                            <FaTrash className="text-[10px]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Output Parameters & Camera Motion */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <CustomSelect
                label="Aspect Ratio"
                value={aspectRatio}
                options={ASPECT_RATIOS}
                onChange={setAspectRatio}
                tooltip="16:9 for YouTube & Cinema, 9:16 for TikTok, Instagram Reels & YouTube Shorts"
              />
              <CustomSelect
                label="Resolution"
                value={resolution}
                options={RESOLUTIONS}
                onChange={setResolution}
                tooltip="720p HD for crisp detail, or 480p for ultra-fast draft generation"
              />
              <CustomSelect
                label="Duration"
                value={duration}
                options={getAvailableDurations()}
                onChange={setDuration}
                tooltip="Length of the generated video clip in seconds"
              />
              <CustomSelect
                label="Quality"
                value={quality}
                options={QUALITIES}
                onChange={setQuality}
                tooltip="High quality applies extra inference steps for smoother texture and clarity"
              />
              <div className="col-span-2 sm:col-span-2">
                <CustomSelect
                  label="Camera Motion"
                  value={cameraMotion}
                  options={CAMERA_MOTIONS}
                  onChange={setCameraMotion}
                  icon={FaCompass}
                  tooltip="Guides the AI virtual camera trajectory (dolly, pan, tilt, orbit, or static tripod)"
                />
              </div>
            </div>

            {/* Auto Sound Effects Toggle with Tooltip */}
            <div className="flex items-center justify-between p-3 bg-glass-hover/60 border border-glass-border rounded-lg">
              <div className="flex items-center gap-2">
                <FaMusic className="text-amber-400 text-xs" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-foreground">
                      Auto-Synthesize Audio & Foley
                    </span>
                    <Tooltip content="Synthesizes realistic synchronized atmospheric audio and sound effects (MMAudio v2) alongside the video.">
                      <span className="text-[9px] text-muted hover:text-primary cursor-pointer">ⓘ</span>
                    </Tooltip>
                  </div>
                  <p className="text-[9px] text-muted">Synchronized atmospheric audio track</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoAudio(!autoAudio)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  autoAudio ? "bg-amber-500" : "bg-divider"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    autoAudio ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={
              loading ||
              (mode === "text-to-video" && !prompt.trim()) ||
              (mode !== "text-to-video" && imagesList.length === 0)
            }
            className="w-full bg-primary text-white rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-primary/20"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : session?.user?.byokEnabled ? (
              "Generate (BYOK • 0 Credits)"
            ) : (
              `Generate (${creditCost} Credits)`
            )}
          </button>

          {error && (
            <p className="text-[10px] text-red-500 font-medium text-center">
              {error}
            </p>
          )}
        </div>

        {/* Right: Preview Canvas */}
        <div className="bg-glass-bg border border-glass-border rounded-xl p-6 flex flex-col gap-4 min-h-[520px] shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Render Canvas
            </h2>
            {resultUrl && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Ready
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-glass-hover rounded-xl border border-glass-border relative overflow-hidden group">
            {resultUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-between p-4 gap-4">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-2xl flex items-center justify-center">
                  <video
                    src={resultUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        downloadMedia(resultUrl, `maxmotion-${Date.now()}.mp4`)
                      }
                      className="p-2.5 bg-black/80 hover:bg-black text-white rounded-full shadow-lg transition-transform hover:scale-110"
                      title="Download MP4"
                    >
                      <FiDownload size={14} />
                    </button>
                  </div>
                </div>

                {/* Export & Sharing Suite */}
                <div className="w-full space-y-2">
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() =>
                        downloadMedia(resultUrl, `maxmotion-${Date.now()}.mp4`)
                      }
                      className="py-2 px-2 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-lg text-[10px] font-bold text-foreground transition-all flex items-center justify-center gap-1.5"
                    >
                      <FiDownload size={11} className="text-primary" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      disabled={!publicShareUrl}
                      className="py-2 px-2 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-lg text-[10px] font-bold text-foreground transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      {copiedLink ? (
                        <FaCheck size={10} className="text-emerald-400" />
                      ) : (
                        <FaCopy size={10} className="text-primary" />
                      )}
                      <span>{copiedLink ? "Copied" : "Link"}</span>
                    </button>

                    <button
                      onClick={handleCopyEmbed}
                      disabled={!publicShareUrl}
                      className="py-2 px-2 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-lg text-[10px] font-bold text-foreground transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      {copiedEmbed ? (
                        <FaCheck size={10} className="text-emerald-400" />
                      ) : (
                        <FaCode size={10} className="text-primary" />
                      )}
                      <span>{copiedEmbed ? "Copied" : "Embed"}</span>
                    </button>

                    <button
                      onClick={handleNativeShare}
                      disabled={!publicShareUrl}
                      className="py-2 px-2 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-lg text-[10px] font-bold text-foreground transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      <FaShareAlt size={10} className="text-primary" />
                      <span>Share</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted px-1">
                    <span>Engine: {model}</span>
                    <span>{resolution} • {duration}s</span>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                {/* Cinematic Radar Scanning Pulse Animation */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-40" />
                  <div className="absolute w-14 h-14 rounded-full border border-primary/40 animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-lg shadow-primary/30">
                    <FaMagic className="animate-spin text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {statusMessage}
                  </p>
                  <p className="text-[10px] text-muted">
                    Active Engine: <span className="font-bold text-primary">{model}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-glass-bg border border-glass-border flex items-center justify-center text-muted">
                  <FaVideo size={18} />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Ready to Synthesize
                </p>
                <p className="text-[10px] text-muted max-w-xs">
                  Choose an engine, write a prompt or pick an inspiration template to render your scene.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
