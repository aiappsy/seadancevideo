"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FaFilm,
  FaPlay,
  FaPause,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaShareAlt,
  FaDownload,
  FaLayerGroup,
  FaSync,
} from "react-icons/fa";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

export default function SequencerPage() {
  const { data: session } = useSession();
  const [creations, setCreations] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    fetch("/api/creations")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const completed = data.filter((c) => c.status === "completed" && c.imageUrl);
        setCreations(completed);
        if (completed.length > 0 && timeline.length === 0) {
          // Pre-populate timeline with first 2-3 clips
          setTimeline(completed.slice(0, 3));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  // Handle sequential video playback
  const handleVideoEnded = () => {
    if (activeSceneIndex < timeline.length - 1) {
      setActiveSceneIndex(activeSceneIndex + 1);
    } else {
      setIsPlaying(false);
      setActiveSceneIndex(0);
    }
  };

  useEffect(() => {
    if (videoRef.current && timeline[activeSceneIndex]?.imageUrl) {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [activeSceneIndex, timeline]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleAddToTimeline = (item) => {
    if (timeline.length >= 8) {
      toast.error("Timeline limit is 8 scenes per sequence.");
      return;
    }
    setTimeline([...timeline, item]);
    toast.success(`Added Scene ${timeline.length + 1}`);
  };

  const handleRemoveScene = (idx) => {
    const updated = timeline.filter((_, i) => i !== idx);
    setTimeline(updated);
    if (activeSceneIndex >= updated.length) {
      setActiveSceneIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMoveScene = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= timeline.length) return;
    const updated = [...timeline];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    setTimeline(updated);
    setActiveSceneIndex(newIdx);
  };

  const activeScene = timeline[activeSceneIndex];
  const totalDuration = timeline.reduce((acc, curr) => acc + (curr.duration || 5), 0);

  return (
    <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col bg-bg-page text-foreground">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-glass-border pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
              <FaLayerGroup className="text-amber-400" size={18} />
              <span>Multi-Scene Storyboard Sequencer</span>
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Sequence multiple AI video clips into a continuous broadcast commercial or viral social reel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-glass-bg border border-glass-border text-muted font-mono">
              Total: {totalDuration}s • {timeline.length} Scenes
            </span>
            <button
              onClick={() => {
                if (timeline.length === 0) return;
                navigator.clipboard.writeText(window.location.href);
                toast.success("Sequence project saved!");
              }}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              Save Sequence
            </button>
          </div>
        </div>

        {/* Master Sequencer Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Main Continuous Player Screen */}
          <div className="lg:col-span-2 space-y-4 flex flex-col">
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-glass-border shadow-2xl flex items-center justify-center group">
              {activeScene ? (
                <video
                  ref={videoRef}
                  src={activeScene.imageUrl}
                  onEnded={handleVideoEnded}
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 text-muted space-y-2">
                  <FaFilm className="mx-auto text-3xl opacity-40" />
                  <p className="text-xs">No scenes in timeline. Add clips below to direct your sequence.</p>
                </div>
              )}

              {/* Scene Watermark Overlay */}
              {activeScene && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Scene {activeSceneIndex + 1} of {timeline.length}</span>
                  <span className="opacity-40">|</span>
                  <span className="font-mono text-amber-300">{activeScene.model}</span>
                </div>
              )}

              {/* Center Play Button Overlay */}
              {activeScene && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-2xl"
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="translate-x-0.5" />}
                </button>
              )}
            </div>

            {/* Playback Controls & Progress Bar */}
            {timeline.length > 0 && (
              <div className="p-3 bg-glass-bg border border-glass-border rounded-xl flex items-center justify-between gap-4">
                <button
                  onClick={togglePlay}
                  className="p-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors shadow"
                >
                  {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                </button>

                {/* Multi-Scene Segmented Progress Indicator */}
                <div className="flex-1 flex gap-1.5 h-2">
                  {timeline.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveSceneIndex(i)}
                      className={`flex-1 rounded-full cursor-pointer transition-all ${
                        i === activeSceneIndex
                          ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                          : i < activeSceneIndex
                          ? "bg-primary"
                          : "bg-glass-hover"
                      }`}
                    />
                  ))}
                </div>

                <span className="text-[11px] font-mono text-muted">
                  Scene {activeSceneIndex + 1}/{timeline.length}
                </span>
              </div>
            )}

            {/* Horizontal Timeline Strip */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-muted tracking-wider">
                Active Storyboard Sequence
              </span>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {timeline.map((scene, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`relative w-44 shrink-0 p-2 rounded-xl border transition-all cursor-pointer space-y-1.5 group ${
                      idx === activeSceneIndex
                        ? "bg-primary/15 border-amber-400 shadow-md shadow-amber-400/20"
                        : "bg-glass-bg border-glass-border hover:border-glass-border-hover"
                    }`}
                  >
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                      <video src={scene.imageUrl} className="w-full h-full object-cover pointer-events-none" />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white">
                        #{idx + 1}
                      </span>
                    </div>

                    <p className="text-[10px] text-foreground font-medium truncate">
                      {scene.prompt}
                    </p>

                    {/* Move & Delete Scene Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-glass-border text-muted">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveScene(idx, -1);
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:text-foreground disabled:opacity-20"
                        >
                          <FaArrowLeft size={9} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveScene(idx, 1);
                          }}
                          disabled={idx === timeline.length - 1}
                          className="p-1 hover:text-foreground disabled:opacity-20"
                        >
                          <FaArrowRight size={9} />
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveScene(idx);
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <FaTrash size={9} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Media Clip Selector Library */}
          <div className="bg-glass-bg border border-glass-border rounded-2xl p-4 flex flex-col space-y-4 max-h-[700px]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Your Studio Clips
              </h2>
              <p className="text-[10px] text-muted">Click any clip to append it to the sequence</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {loading ? (
                <div className="p-8 text-center text-xs text-muted">Loading clips...</div>
              ) : creations.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted space-y-2">
                  <p>No completed clips yet.</p>
                  <Link href="/workspace" className="text-primary underline font-bold">
                    Generate clips in Studio
                  </Link>
                </div>
              ) : (
                creations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddToTimeline(item)}
                    className="p-2 rounded-xl bg-glass-hover hover:bg-glass-bg border border-glass-border hover:border-primary/50 transition-all cursor-pointer flex gap-3 items-center group"
                  >
                    <div className="w-20 aspect-video bg-black rounded-lg overflow-hidden relative shrink-0">
                      <video src={item.imageUrl} className="w-full h-full object-cover pointer-events-none" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">
                        {item.prompt}
                      </p>
                      <span className="text-[9px] text-muted uppercase font-mono">
                        {item.model} • {item.duration || 5}s
                      </span>
                    </div>
                    <button className="p-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaPlus size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
