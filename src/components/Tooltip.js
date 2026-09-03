"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function Tooltip({
  children,
  content,
  position = "auto",
  className = "",
  as = "div",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, actualPos: "top" });
  const triggerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    let chosenPos = position;
    if (position === "auto") {
      // If element is in top 80px of window (e.g. Navbar), display below it
      chosenPos = rect.top < 80 ? "bottom" : "top";
    }

    let x = rect.left + rect.width / 2;
    let y = rect.top;

    if (chosenPos === "top") {
      y = rect.top - 8;
    } else if (chosenPos === "bottom") {
      y = rect.bottom + 8;
    } else if (chosenPos === "left") {
      x = rect.left - 8;
      y = rect.top + rect.height / 2;
    } else if (chosenPos === "right") {
      x = rect.right + 8;
      y = rect.top + rect.height / 2;
    }

    // Keep horizontally within window bounds
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
    x = Math.max(120, Math.min(screenWidth - 120, x));

    setCoords({ x, y, actualPos: chosenPos });
  }, [position]);

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  if (!content) return children;

  const titleString = typeof content === "string" ? content : undefined;

  const Component = as;

  return (
    <>
      <Component
        ref={triggerRef}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        title={titleString}
      >
        {children}
      </Component>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: "fixed",
                  left: coords.x,
                  top: coords.y,
                  transform:
                    coords.actualPos === "top"
                      ? "translate(-50%, -100%)"
                      : coords.actualPos === "bottom"
                      ? "translate(-50%, 0)"
                      : coords.actualPos === "left"
                      ? "translate(-100%, -50%)"
                      : "translate(0, -50%)",
                  zIndex: 999999,
                  pointerEvents: "none",
                }}
                className="px-3 py-1.5 bg-neutral-950/95 border border-amber-400/40 text-neutral-100 text-[11px] font-semibold rounded-lg shadow-[0_12px_40px_-8px_rgba(0,0,0,0.9)] backdrop-blur-md max-w-xs text-center leading-snug tracking-wide"
              >
                {content}
                {/* Visual Arrow Indicator */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    ...(coords.actualPos === "top"
                      ? { bottom: "-4px", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid rgba(251, 191, 36, 0.4)" }
                      : { top: "-4px", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "5px solid rgba(251, 191, 36, 0.4)" }),
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
