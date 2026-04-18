"use client";

import { motion } from "framer-motion";
import { ArrowDown, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { GenerativeGrid } from "./GenerativeGrid";
import { useTranslation } from "@/i18n/context";
import { useSectionNav } from "@/components/scroll-zoom/SectionProvider";

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: EASE },
  }),
};

export function Hero() {
  const { T } = useTranslation();
  const { sectionIds, navigate } = useSectionNav();

  const handleAnchor = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const idx = sectionIds.indexOf(id);
    if (idx !== -1) navigate(idx);
  };

  const credentials = [
    { icon: Briefcase, text: T.hero.credential0 },
    { icon: GraduationCap, text: T.hero.credential1 },
    { icon: MapPin, text: T.hero.credential2 },
  ];

  return (
    <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left — typography */}
      <div className="relative z-10 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-24 lg:py-0">
        {/* Status chip */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 mb-10 w-fit"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
          </span>
          <span className="font-mono text-xs text-[var(--muted-foreground)] tracking-widest uppercase">
            {T.hero.available}
          </span>
        </motion.div>

        {/* Name */}
        <motion.div
          custom={0.5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex items-center gap-3 mb-4"
        >
          <span className="h-px w-5 bg-[var(--accent)] flex-shrink-0" />
          <span className="font-mono text-sm tracking-[0.18em] uppercase text-[var(--foreground)]">
            Lemaire Quentin
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[1.0] tracking-[-0.03em] text-balance"
        >
          Full-stack
          <br />
          <span className="text-[var(--accent)]">Product</span>
          <br />
          Builder.
        </motion.h1>

        {/* Divider */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 mb-6 h-px w-12 bg-[var(--border)]"
        />

        {/* Subtitle */}
        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-[var(--muted-foreground)] text-base sm:text-lg max-w-sm leading-relaxed mb-8"
        >
          {T.hero.subtitleBefore}{" "}
          <span className="text-[var(--foreground)]">{T.hero.subtitleHighlight}</span>{" "}
          {T.hero.subtitleAfter}
        </motion.p>

        {/* Credentials */}
        <motion.div
          custom={3.5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2 mb-10"
        >
          {credentials.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-[var(--muted-foreground)]">
              <Icon size={13} className="text-[var(--accent)] flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA row */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-4"
        >
          <a
            href="#projects"
            onClick={handleAnchor("projects")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium
              bg-[var(--accent)] text-black rounded-sm
              hover:bg-[var(--foreground)] transition-colors duration-200"
          >
            {T.hero.ctaProjects}
          </a>
          <a
            href="#contact"
            onClick={handleAnchor("contact")}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium
              border border-[var(--border)] text-[var(--foreground)] rounded-sm
              hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-200"
          >
            {T.hero.ctaContact}
          </a>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-8 sm:left-12 lg:left-16 xl:left-24 flex items-center gap-2 text-[var(--muted-foreground)]"
        >
          <ArrowDown size={13} />
          <span className="font-mono text-xs tracking-widest uppercase">{T.hero.scroll}</span>
        </motion.div>
      </div>

      {/* Right — generative grid */}
      <section className="relative hidden lg:block border-l border-[var(--border)] overflow-hidden">
        <GenerativeGrid />
        <div className="absolute inset-0 bg-radial-[at_70%_30%] from-transparent via-transparent to-[var(--background)] opacity-60 pointer-events-none" />
        <div className="absolute bottom-12 right-12 text-right space-y-1 pointer-events-none">
          <p className="font-mono text-[10px] text-[var(--muted-foreground)] tracking-widest uppercase">{T.hero.generativeField}</p>
          <p className="font-mono text-[10px] text-[var(--border)] tracking-widest">{T.hero.reactsTo}</p>
        </div>
      </section>

      {/* Global grid lines */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </section>
  );
}
