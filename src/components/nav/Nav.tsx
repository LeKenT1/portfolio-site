"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { useTranslation } from "@/i18n/context";

export function Nav() {
  const { T, locale, setLocale } = useTranslation();
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 40));
  }, [scrollY]);

  const navLinks = [
    { label: T.nav.projects, href: "#projects" },
    { label: T.nav.stack, href: "#expertise" },
    { label: T.nav.process, href: "#ai" },
    { label: T.nav.contact, href: "#contact" },
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
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-[var(--border)]"
        style={{ opacity: borderOpacity }}
      />

      {/* Logo / Name */}
      <a
        href="#"
        className="font-mono text-xs tracking-widest uppercase text-[var(--foreground)] hover:text-[var(--accent)] transition-colors duration-200"
      >
        LQ
      </a>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-7">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-xs font-mono tracking-widest uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
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
