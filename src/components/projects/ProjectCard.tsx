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
  const [direction, setDirection] = useState(1);
  const [autoKey, setAutoKey] = useState(0);

  useEffect(() => {
    setIndex(0);
    setDirection(1);
    setAutoKey(0);
  }, [projectId]);

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
    <div className="relative w-full h-full overflow-hidden bg-[var(--muted)] group/carousel">
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
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 66vw"
            quality={100}
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--card)] to-transparent z-10" />

      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="absolute top-4 left-4 z-20"
      >
        <span className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-sm bg-[var(--accent)] text-[#0a0a0a]">
          ◆ Featured
        </span>
      </motion.div>

      {images.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="absolute top-4 right-4 z-20 font-mono text-[10px] tracking-widest text-[var(--accent)] bg-[var(--card)]/70 border border-[var(--card-border)] px-2 py-1 rounded-sm backdrop-blur-sm"
        >
          {index + 1} / {images.length}
        </motion.div>
      )}

      {images.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
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
        </motion.div>
      )}

      {images.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5"
        >
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
        </motion.div>
      )}
    </div>
  );
}

// ─── Unified card (featured + sidebar) ───────────────────────────────────────

export function ProjectCard({
  project,
  isFeatured,
  onSelect,
}: {
  project: ProjectData;
  isFeatured: boolean;
  onSelect?: () => void;
}) {
  const thumb = project.images[0];

  return (
    <motion.article
      layoutId={`card-${project.id}`}
      layout
      onClick={!isFeatured ? onSelect : undefined}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={!isFeatured ? { y: -2 } : undefined}
      whileTap={!isFeatured ? { scale: 0.98 } : undefined}
      className={[
        "relative flex flex-col overflow-hidden rounded-sm bg-[var(--card)]",
        isFeatured
          ? "border border-[var(--accent)]/30"
          : "border border-[var(--card-border)] cursor-pointer hover:border-[var(--border)] transition-colors duration-300 group",
      ].join(" ")}
    >
      {/* Image area — layoutId lets it morph between sizes */}
      <motion.div
        layoutId={`img-${project.id}`}
        layout
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className={[
          "relative w-full overflow-hidden bg-[var(--muted)] border-b border-[var(--card-border)]",
          isFeatured ? "h-80 sm:h-[28rem]" : "h-36 sm:h-40",
        ].join(" ")}
      >
        {isFeatured ? (
          <ImageCarousel images={project.images} projectId={project.id} />
        ) : (
          <>
            <Image
              src={thumb}
              alt={project.title}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-[1.05]"
              sizes="(max-width: 1024px) 100vw, 33vw"
              quality={100}
            />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--card)] to-transparent" />
          </>
        )}
      </motion.div>

      {/* Content */}
      <motion.div layout className="p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {project.accentLabel && (
              <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--accent)] shrink-0">
                {project.accentLabel}
              </span>
            )}
            <a
              href={project.href ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={[
                "font-semibold leading-tight tracking-tight truncate hover:underline underline-offset-2",
                isFeatured
                  ? "text-base text-[var(--foreground)] hover:text-[var(--accent)]"
                  : "text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors duration-200",
              ].join(" ")}
            >
              {project.title}
            </a>
          </div>
          <a
            href={project.href ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.title}`}
            onClick={(e) => e.stopPropagation()}
            className={[
              "flex-shrink-0 p-1.5 transition-colors duration-200 rounded-sm",
              isFeatured
                ? "text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:bg-[var(--muted)]"
                : "text-[var(--muted-foreground)] group-hover:text-[var(--accent)]",
            ].join(" ")}
          >
            <ArrowUpRight size={isFeatured ? 16 : 13} />
          </a>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[var(--accent-dim)] border border-[rgba(200,169,126,0.18)] self-start">
            <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
            <span className={`font-mono text-[var(--accent)] tracking-wide ${isFeatured ? "text-[11px]" : "text-[10px]"}`}>
              {project.highlight}
            </span>
          </div>
          {isFeatured && (
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
          )}
        </div>
      </motion.div>

      <div
        className={[
          "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent",
          isFeatured ? "opacity-50" : "opacity-0 group-hover:opacity-40 transition-opacity duration-500",
        ].join(" ")}
      />
    </motion.article>
  );
}

// ─── Legacy exports (kept for any external usage) ─────────────────────────────

export function FeaturedProjectCard({ project }: { project: ProjectData }) {
  return <ProjectCard project={project} isFeatured={true} />;
}

export function SidebarProjectCard({
  project,
  onClick,
}: {
  project: ProjectData;
  onClick: () => void;
}) {
  return <ProjectCard project={project} isFeatured={false} onSelect={onClick} />;
}
