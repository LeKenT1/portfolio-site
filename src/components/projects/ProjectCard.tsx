"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

export interface ProjectData {
  id: string;
  title: string;
  highlight: string;
  description: string;
  tags: string[];
  href?: string;
  accentLabel?: string;
  images: string[];
}

// ─── Carousel inside the featured card ───────────────────────────────────────

function ImageCarousel({ images, projectId }: { images: string[]; projectId: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  // Incrementing this restarts the auto-advance interval from zero
  const [autoKey, setAutoKey] = useState(0);

  // Reset to first image whenever the featured project changes
  useEffect(() => {
    setIndex(0);
    setDirection(1);
    setAutoKey(0);
  }, [projectId]);

  // Auto-advance every 8 s. Restarted whenever the user navigates manually.
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % images.length);
    }, 8000);
    return () => clearInterval(id);
  }, [images, projectId, autoKey]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + images.length) % images.length);
    setAutoKey((k) => k + 1);
  }, [images.length]);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % images.length);
    setAutoKey((k) => k + 1);
  }, [images.length]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="relative w-full h-80 sm:h-[28rem] overflow-hidden bg-[var(--muted)] border-b border-[var(--card-border)] group/carousel">
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={projectId + "-" + index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={`Screenshot ${index + 1}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--card)] to-transparent z-10" />

      {/* Featured badge */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="absolute top-4 left-4 z-20"
      >
        <span className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-sm bg-[var(--accent)] text-[#0a0a0a]">
          ◆ Featured
        </span>
      </motion.div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 z-20 font-mono text-[10px] tracking-widest text-[var(--accent)] bg-[var(--card)]/70 border border-[var(--card-border)] px-2 py-1 rounded-sm backdrop-blur-sm">
          {index + 1} / {images.length}
        </div>
      )}

      {/* Arrows — visible on hover */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous screenshot"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20
              w-8 h-8 flex items-center justify-center rounded-sm
              bg-[var(--card)]/80 border border-[var(--card-border)] backdrop-blur-sm
              text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40
              opacity-0 group-hover/carousel:opacity-100
              transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            aria-label="Next screenshot"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20
              w-8 h-8 flex items-center justify-center rounded-sm
              bg-[var(--card)]/80 border border-[var(--card-border)] backdrop-blur-sm
              text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40
              opacity-0 group-hover/carousel:opacity-100
              transition-all duration-200 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); setAutoKey((k) => k + 1); }}
              aria-label={`Go to screenshot ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === index
                  ? "w-4 bg-[var(--accent)]"
                  : "w-1 bg-[var(--muted-foreground)]/40 hover:bg-[var(--muted-foreground)]/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────

export function FeaturedProjectCard({ project }: { project: ProjectData }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative flex flex-col h-full bg-[var(--card)] border border-[var(--accent)]/30 rounded-sm overflow-hidden"
    >
      <ImageCarousel images={project.images} projectId={project.id} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex flex-col p-4 sm:p-5 gap-3"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {project.accentLabel && (
              <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--accent)] shrink-0">
                {project.accentLabel}
              </span>
            )}
            <h3 className="text-base font-semibold leading-tight tracking-tight text-[var(--foreground)] truncate">
              {project.title}
            </h3>
          </div>
          <a
            href={project.href ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.title}`}
            className="flex-shrink-0 p-1.5 text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors duration-200 rounded-sm hover:bg-[var(--muted)]"
          >
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[var(--accent-dim)] border border-[rgba(200,169,126,0.18)]">
            <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-[11px] text-[var(--accent)] tracking-wide">
              {project.highlight}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-[var(--muted)] text-[var(--muted-foreground)] tracking-wide border border-[var(--border)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
    </motion.article>
  );
}

// ─── Sidebar card ─────────────────────────────────────────────────────────────

export function SidebarProjectCard({
  project,
  onClick,
}: {
  project: ProjectData;
  onClick: () => void;
}) {
  const thumb = project.images[0];

  return (
    <motion.article
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onClick={onClick}
      className="group relative flex flex-col cursor-pointer bg-[var(--card)] border border-[var(--card-border)] rounded-sm overflow-hidden hover:border-[var(--border)] transition-colors duration-300"
    >
      {thumb && (
        <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-[var(--muted)] border-b border-[var(--card-border)]">
          <Image
            src={thumb}
            alt={project.title}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--card)] to-transparent" />
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col gap-2">
        {project.accentLabel && (
          <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--accent)]">
            {project.accentLabel}
          </span>
        )}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold leading-tight tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors duration-200">
            {project.title}
          </h3>
          <ArrowUpRight
            size={13}
            className="flex-shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors duration-200"
          />
        </div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(200,169,126,0.18)] self-start">
          <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
          <span className="font-mono text-[10px] text-[var(--accent)] tracking-wide">
            {project.highlight}
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
    </motion.article>
  );
}
