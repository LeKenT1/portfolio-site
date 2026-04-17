"use client";

import { motion } from "framer-motion";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { useTranslation } from "@/i18n/context";
import { useSectionNav } from "@/components/scroll-zoom/SectionProvider";

export function Nav() {
  const { T, locale, setLocale } = useTranslation();
  const { current, sectionIds, navigate } = useSectionNav();
  const scrolled = current > 0;

  const navLinks = [
    { label: T.nav.projects, sectionId: "projects" },
    { label: T.nav.stack, sectionId: "expertise" },
    { label: T.nav.contact, sectionId: "contact" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between
        px-6 sm:px-10 lg:px-16 xl:px-24 h-14 sm:h-16"
      style={{
        backgroundColor: scrolled ? "rgba(10,10,10,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "background-color 0.3s, backdrop-filter 0.3s",
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]"
        style={{ opacity: scrolled ? 1 : 0, transition: "opacity 0.3s ease" }}
      />

      {/* Logo / Name */}
      <button
        onClick={() => navigate(0)}
        className="font-mono text-xs tracking-widest uppercase text-[var(--foreground)] hover:text-[var(--accent)] transition-colors duration-200"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        LQ
      </button>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-7">
        {navLinks.map((link) => {
          const idx = sectionIds.indexOf(link.sectionId);
          const isActive = current === idx;
          return (
            <button
              key={link.sectionId}
              onClick={() => navigate(idx)}
              className="text-xs font-mono tracking-widest uppercase transition-colors duration-200"
              style={{
                color: isActive ? "var(--accent)" : "var(--muted-foreground)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Right — social icons + language switcher */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/LeKenT1"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 p-1"
        >
          <GitHubIcon size={15} />
        </a>
        <a
          href="https://www.linkedin.com/in/quentin-lemaire-aaa947234/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 p-1"
        >
          <LinkedInIcon size={15} />
        </a>
        <button
          onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
          aria-label={`Switch to ${locale === "fr" ? "English" : "Français"}`}
          className="ml-1 font-mono text-xs tracking-widest uppercase text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          {T.nav.langSwitch}
        </button>
      </div>
    </motion.header>
  );
}
