"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaMagic,
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaCompass,
  FaFilm,
  FaCheck,
  FaQuestionCircle,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AIAssistantModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your MaxMotion AI Studio Director. Ask me which AI video engine fits your project, how to direct complex camera motion, or let me write a custom cinematic prompt for you!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const starterQuestions = [
    "Which engine is best for human characters?",
    "Write a sci-fi landscape prompt for Wan 2.1",
    "How does the BYOK zero-cost plan work?",
    "What settings should I use for TikTok/Reels?",
  ];

  const handleSend = async (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: newMessages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get advice");

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply,
          suggestedPrompt: data.suggestedPrompt,
          suggestedModel: data.suggestedModel,
          suggestedRatio: data.suggestedRatio,
        },
      ]);
    } catch (err) {
      toast.error(err.message);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I ran into a temporary hiccup connecting to the studio knowledge base. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToStudio = (item) => {
    const params = new URLSearchParams({
      prompt: item.suggestedPrompt,
      model: item.suggestedModel || "wan-2.1",
      aspectRatio: item.suggestedRatio || "16:9",
    });
    setIsOpen(false);
    toast.success("Applied prompt and engine to Studio!");
    router.push(`/?${params.toString()}`);
  };

  return (
    <>
      {/* Persistent Floating Director Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[200] px-4 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-full text-xs font-bold shadow-2xl shadow-primary/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all group border border-white/20"
      >
        <div className="relative">
          <FaRobot size={15} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <span className="hidden sm:inline">AI Studio Director</span>
      </button>

      {/* Slide-over Assistant Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-bg-page border-l border-glass-border shadow-2xl flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-glass-border flex items-center justify-between bg-glass-bg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <FaFilm size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-foreground">
                      MaxMotion AI Studio Director
                    </h3>
                    <p className="text-[10px] text-muted">Creative Advisor & Prompt Specialist</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted hover:text-foreground transition-colors rounded"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-white font-medium rounded-tr-none"
                          : "bg-glass-bg border border-glass-border text-foreground font-normal rounded-tl-none shadow"
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* Action Card if Assistant Provided a Prompt */}
                    {m.suggestedPrompt && (
                      <div className="mt-2.5 max-w-[90%] p-3 bg-primary/10 border border-primary/30 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                            💡 Director Recommendation
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                            {m.suggestedModel}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground italic">
                          &ldquo;{m.suggestedPrompt}&rdquo;
                        </p>
                        <button
                          onClick={() => handleApplyToStudio(m)}
                          className="w-full py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow"
                        >
                          <FaMagic size={10} />
                          <span>Apply to Studio Workspace</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 p-3 bg-glass-bg border border-glass-border rounded-2xl w-fit text-xs text-muted">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Director is formulating advice...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Starter Suggestions */}
              <div className="p-3 border-t border-glass-border bg-glass-bg/50">
                <p className="text-[9px] font-bold uppercase text-muted mb-1.5">
                  Suggested Questions:
                </p>
                <div className="flex flex-wrap gap-1">
                  {starterQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-[9px] px-2 py-1 bg-glass-hover hover:bg-glass-bg border border-glass-border text-secondary-text hover:text-foreground rounded-md transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 border-t border-glass-border bg-glass-bg flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for advice, prompts, or model comparisons..."
                  className="flex-1 px-3 py-2 bg-glass-hover border border-glass-border rounded-xl text-xs text-foreground outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-40"
                >
                  <FaPaperPlane size={12} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
