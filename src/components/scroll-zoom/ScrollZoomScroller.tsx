"use client";

import { useEffect, useRef, ReactNode } from "react";
import { AnimatePresence, motion, usePresence } from "framer-motion";
import { useSectionNav } from "./SectionProvider";

interface Section {
  id: string;
  content: ReactNode;
}

interface Props {
  sections: Section[];
}

type BezierEase = [number, number, number, number];
type Custom = { dir: number; boundary: number };

const EASE_OUT: BezierEase = [0.16, 1, 0.3, 1];
const EASE_IN: BezierEase = [0.76, 0, 0.24, 1];

// ─── Boundary 0 (Hero ↔ Projects): zoom ────────────────────────────────────
const zoomEnter = (dir: number) => ({ scale: dir > 0 ? 0.86 : 1.14, opacity: 0, x: 0, y: 0, rotate: 0 });
const zoomExit  = (dir: number) => ({
  scale: dir > 0 ? 1.1 : 0.9, opacity: 0, x: 0, y: 0, rotate: 0,
  transition: { scale: { duration: 0.4, ease: EASE_IN }, opacity: { duration: 0.25 } },
});

// ─── Boundary 1 (Projects ↔ Expertise): horizontal slide ───────────────────
const slideEnter = (dir: number) => ({ x: `${dir * 100}%`, opacity: 0.4, scale: 1, y: 0, rotate: 0 });
const slideExit  = (dir: number) => ({
  x: `${dir * -100}%`, opacity: 0.4, scale: 1, y: 0, rotate: 0,
  transition: { x: { duration: 0.45, ease: EASE_IN }, opacity: { duration: 0.2 } },
});

const variants = {
  enter: ({ dir, boundary }: Custom) =>
    boundary === 1 ? slideEnter(dir) : zoomEnter(dir),
  center: {
    scale: 1, opacity: 1, x: 0, y: 0, rotate: 0,
    transition: {
      scale:   { duration: 0.65, ease: EASE_OUT },
      x:       { duration: 0.55, ease: EASE_OUT },
      opacity: { duration: 0.35 },
    },
  },
  exit: ({ dir, boundary }: Custom) =>
    boundary === 1 ? slideExit(dir) : zoomExit(dir),
};

// ─── Boundary 2 (Expertise ↔ Contact): split curtain ───────────────────────
// Content rendered once. Two background-coloured curtains slide apart on
// enter (top goes up, bottom goes down) and close on exit (reversed).
function SplitSection({ children }: { children: ReactNode }) {
  const [isPresent, safeToRemove] = usePresence();

  const curtainTransition = {
    duration: isPresent ? 0.7 : 0.5,
    ease: (isPresent ? EASE_OUT : EASE_IN) as BezierEase,
  };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Content — rendered once */}
      <div style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
        {children}
      </div>

      {/* Top curtain — starts covering top half, slides up to reveal */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: isPresent ? "-100%" : "0%" }}
        transition={curtainTransition}
        onAnimationComplete={() => { if (!isPresent) safeToRemove?.(); }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "50%",
          background: "var(--background)",
          zIndex: 10,
        }}
      />

      {/* Bottom curtain — starts covering bottom half, slides down to reveal */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: isPresent ? "100%" : "0%" }}
        transition={curtainTransition}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
          background: "var(--background)",
          zIndex: 10,
        }}
      />
    </div>
  );
}

// ─── Main scroller ──────────────────────────────────────────────────────────
export function ScrollZoomScroller({ sections }: Props) {
  const { current, direction, boundary, navigate, onTransitionComplete } = useSectionNav();
  const custom: Custom = { dir: direction, boundary };
  const scrollerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isLastSection = current === sections.length - 1;

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
  }, [current]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Last section uses SplitSection (no internal scroll container)
      if (isLastSection) {
        e.preventDefault();
        navigate(current + (e.deltaY > 0 ? 1 : -1));
        return;
      }

      const el = scrollerRef.current;
      if (!el) return;

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      const atTop = el.scrollTop <= 4;

      if (e.deltaY > 0 && atBottom) { e.preventDefault(); navigate(current + 1); }
      else if (e.deltaY < 0 && atTop) { e.preventDefault(); navigate(current - 1); }
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd   = (e: TouchEvent) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 60) navigate(current + (delta > 0 ? 1 : -1));
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") navigate(current + 1);
      if (e.key === "ArrowUp"   || e.key === "PageUp")   navigate(current - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    window.addEventListener("keydown",    onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown",    onKeyDown);
    };
  }, [current, isLastSection, navigate]);

  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        <AnimatePresence custom={custom} mode="wait" onExitComplete={onTransitionComplete}>
          {isLastSection ? (
            <SplitSection key={current}>
              {sections[current].content}
            </SplitSection>
          ) : (
            <motion.div
              key={current}
              ref={scrollerRef}
              custom={custom}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-y-auto"
              style={{ willChange: "transform, opacity" }}
            >
              {sections[current].content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section indicator dots */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5" aria-hidden="true">
        {sections.map((section, i) => (
          <button
            key={section.id}
            onClick={() => navigate(i)}
            title={section.id}
            style={{
              width: "6px",
              height: i === current ? "20px" : "6px",
              background: i === current ? "var(--accent)" : "var(--border)",
              borderRadius: "99px",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "height 0.35s cubic-bezier(0.16,1,0.3,1), background 0.35s ease",
            }}
          />
        ))}
      </div>
    </>
  );
}
