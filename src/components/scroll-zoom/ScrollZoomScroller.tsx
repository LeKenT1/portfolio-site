"use client";

import { useEffect, useRef, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSectionNav } from "./SectionProvider";

interface Section {
  id: string;
  content: ReactNode;
}

interface Props {
  sections: Section[];
}

type BezierEase = [number, number, number, number];

const EASE_OUT: BezierEase = [0.16, 1, 0.3, 1];
const EASE_IN: BezierEase = [0.76, 0, 0.24, 1];

const variants = {
  enter: (dir: number) => ({
    scale: dir > 0 ? 0.86 : 1.14,
    opacity: 0,
  }),
  center: {
    scale: 1,
    opacity: 1,
    transition: {
      scale: { duration: 0.65, ease: EASE_OUT },
      opacity: { duration: 0.35 },
    },
  },
  exit: (dir: number) => ({
    scale: dir > 0 ? 1.1 : 0.9,
    opacity: 0,
    transition: {
      scale: { duration: 0.4, ease: EASE_IN },
      opacity: { duration: 0.25 },
    },
  }),
};

export function ScrollZoomScroller({ sections }: Props) {
  const { current, direction, navigate, onTransitionComplete } = useSectionNav();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  // Reset inner scroll to top when section changes
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
    }
  }, [current]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const el = scrollerRef.current;
      if (!el) return;

      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      const atTop = el.scrollTop <= 4;

      if (e.deltaY > 0 && atBottom) {
        e.preventDefault();
        navigate(current + 1);
      } else if (e.deltaY < 0 && atTop) {
        e.preventDefault();
        navigate(current - 1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 60) {
        navigate(current + (delta > 0 ? 1 : -1));
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") navigate(current + 1);
      if (e.key === "ArrowUp" || e.key === "PageUp") navigate(current - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [current, navigate]);

  return (
    <>
      <div className="fixed inset-0 overflow-hidden">
        <AnimatePresence
          custom={direction}
          mode="wait"
          onExitComplete={onTransitionComplete}
        >
          <motion.div
            key={current}
            ref={scrollerRef}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full overflow-y-auto"
            style={{ willChange: "transform, opacity" }}
          >
            {sections[current].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Section indicator dots */}
      <div
        className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5"
        aria-hidden="true"
      >
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
