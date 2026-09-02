"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaDownload,
  FaShareAlt,
  FaCode,
  FaCopy,
  FaMagic,
  FaArrowLeft,
  FaCheck,
  FaFilm,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function VideoShareClient({ creation }) {
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const embedCode = `<iframe src="${shareUrl}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyEmbed = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      toast.success("Embed HTML code copied!");
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI Video on MaxMotion AI",
          text: creation.prompt,
          url: shareUrl,
        });
      } catch (err) {
        // Ignored if user dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(creation.imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maxmotion-${creation.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started!");
    } catch (e) {
      toast.error("Download failed; opening video directly.");
      window.open(creation.imageUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleRemix = () => {
    // Navigate to studio with preloaded query params
    const params = new URLSearchParams({
      prompt: creation.prompt,
      model: creation.model,
      aspectRatio: creation.aspectRatio,
      resolution: creation.resolution,
    });
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-dvh bg-bg-page text-primary-text flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="max-w-4xl w-full space-y-6">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-primary transition-colors"
          >
            <FaArrowLeft size={10} /> Back to Studio
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5">
              <FaFilm size={10} /> {creation.model}
            </span>
          </div>
        </div>

        {/* Video Player Display */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-glass-border shadow-2xl flex items-center justify-center group">
          <video
            src={creation.imageUrl}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Export & Sharing Actions Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="py-2.5 px-3 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-xl text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2 shadow"
          >
            <FaDownload size={11} className="text-primary" />
            <span>{downloading ? "Saving..." : "Download MP4"}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="py-2.5 px-3 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-xl text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2 shadow"
          >
            {copiedLink ? (
              <FaCheck size={11} className="text-emerald-400" />
            ) : (
              <FaCopy size={11} className="text-primary" />
            )}
            <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
          </button>

          <button
            onClick={handleCopyEmbed}
            className="py-2.5 px-3 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-xl text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2 shadow"
          >
            {copiedEmbed ? (
              <FaCheck size={11} className="text-emerald-400" />
            ) : (
              <FaCode size={11} className="text-primary" />
            )}
            <span>{copiedEmbed ? "Copied!" : "Embed Code"}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 bg-glass-bg hover:bg-glass-hover border border-glass-border rounded-xl text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2 shadow"
          >
            <FaShareAlt size={11} className="text-primary" />
            <span>Share</span>
          </button>

          <button
            onClick={handleRemix}
            className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            <FaMagic size={11} />
            <span>Remix in Studio</span>
          </button>
        </div>

        {/* Video Prompt & Metadata Card */}
        <div className="bg-glass-bg border border-glass-border rounded-2xl p-6 space-y-4 shadow-lg">
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
              Generation Prompt
            </h2>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              &ldquo;{creation.prompt}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-glass-border text-[11px]">
            <div>
              <span className="text-muted block text-[9px] uppercase font-bold">Engine</span>
              <span className="font-bold text-foreground">{creation.model}</span>
            </div>
            <div>
              <span className="text-muted block text-[9px] uppercase font-bold">Aspect Ratio</span>
              <span className="font-bold text-foreground">{creation.aspectRatio}</span>
            </div>
            <div>
              <span className="text-muted block text-[9px] uppercase font-bold">Resolution</span>
              <span className="font-bold text-foreground">{creation.resolution}</span>
            </div>
            <div>
              <span className="text-muted block text-[9px] uppercase font-bold">Duration</span>
              <span className="font-bold text-foreground">{creation.duration} Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
