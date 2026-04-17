"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";
import { ContactForm } from "./ContactForm";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useTranslation } from "@/i18n/context";

export function Contact() {
  const { T } = useTranslation();

  const links = [
    {
      icon: <GitHubIcon size={15} />,
      label: "GitHub",
      href: "https://github.com/LeKenT1",
      sub: "github.com/LeKenT1",
    },
    {
      icon: <LinkedInIcon size={15} />,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/quentin-lemaire-aaa947234/",
      sub: "linkedin.com/in/quentin-lemaire",
    },
    {
      icon: <Mail size={15} />,
      label: "Email",
      href: "mailto:lemaireq.84@gmail.com",
      sub: "lemaireq.84@gmail.com",
    },
  ];

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 px-4 sm:px-8 lg:px-16 xl:px-24 border-t border-[var(--border)]"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Left */}
        <div>
          <SectionLabel>{T.contact.label}</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-3 mb-4 text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            {T.contact.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-[var(--muted-foreground)] leading-relaxed mb-10 max-w-sm"
          >
            {T.contact.description}
          </motion.p>

          <div className="space-y-3">
            {links.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                className="flex items-center gap-4 p-4 rounded-sm border border-[var(--border)]
                  bg-[var(--card)] hover:border-[var(--accent)] group transition-colors duration-200"
              >
                <span className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors duration-200">
                  {link.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{link.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-mono">{link.sub}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ContactForm />
        </motion.div>
      </div>
    </section>
  );
}
