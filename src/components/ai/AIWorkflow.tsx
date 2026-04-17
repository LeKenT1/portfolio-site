"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ShieldCheck, GitBranch, Zap } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useTranslation } from "@/i18n/context";

const PRINCIPLE_ICONS = [Zap, ShieldCheck, BrainCircuit, GitBranch];

export function AIWorkflow() {
  const { T } = useTranslation();

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-8 lg:px-16 xl:px-24 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <SectionLabel>{T.ai.label}</SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-3 mb-4 text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            {T.ai.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-[var(--muted-foreground)] leading-relaxed mb-12"
          >
            {T.ai.subtitle}
          </motion.p>
        </div>

        {/* Bordered philosophy box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-[var(--border)] rounded-sm p-8 sm:p-10 bg-[var(--card)]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {T.ai.principles.map((p, i) => {
              const Icon = PRINCIPLE_ICONS[i];
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex gap-4"
                >
                  <div className="mt-0.5 flex-shrink-0 p-2 rounded-sm bg-[var(--muted)] h-fit">
                    <Icon size={15} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1.5">{p.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Stat bar */}
          <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-8">
            {[
              { value: "40x", label: T.ai.statProductivity },
              { value: "100%", label: T.ai.statCodeReviewed },
              { value: "0", label: T.ai.statBlackBox },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-semibold text-[var(--accent)]">{stat.value}</p>
                <p className="text-xs text-[var(--muted-foreground)] font-mono tracking-wide mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
