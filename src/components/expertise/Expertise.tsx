"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Database,
  Globe,
  Server,
  HardDrive,
  Container,
  Layers,
  Cpu,
} from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useTranslation } from "@/i18n/context";

const devStack = [
  { icon: Code2, label: "React 19", sub: "Concurrent features, RSC" },
  { icon: Layers, label: "Next.js 15", sub: "App Router, Server Actions" },
  { icon: Globe, label: "Vercel", sub: "Edge deployments, CI/CD" },
  { icon: Database, label: "Supabase", sub: "Postgres, Auth, Realtime" },
];

const infraStack = [
  { icon: HardDrive, label: "NAS Servers", sub: "Synology, TrueNAS" },
  { icon: Container, label: "Docker", sub: "Compose, multi-service stacks" },
  { icon: Cpu, label: "CasaOS", sub: "Self-hosted OS layer" },
  { icon: Server, label: "Jellyfin", sub: "Media server, streaming" },
];

const EASE = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

const itemVariant = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: EASE },
  }),
};

function StackItem({
  icon: Icon,
  label,
  sub,
  index,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={itemVariant}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="group flex items-center gap-4 p-4 rounded-sm border border-[var(--border)]
        bg-[var(--card)] hover:border-[var(--accent)] hover:bg-[var(--muted)]
        transition-all duration-200"
    >
      <div className="p-2 rounded-sm bg-[var(--muted)] group-hover:bg-[var(--accent-dim)] transition-colors duration-200">
        <Icon size={15} className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors duration-200" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

export function Expertise() {
  const { T } = useTranslation();

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-8 lg:px-16 xl:px-24 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <SectionLabel>{T.expertise.label}</SectionLabel>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-3 mb-16 text-3xl sm:text-4xl font-semibold tracking-tight"
        >
          {T.expertise.title}
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Development Stack */}
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-[var(--muted-foreground)] mb-6">
              {T.expertise.devLabel}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {devStack.map((item, i) => (
                <StackItem key={item.label} {...item} index={i} />
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-[var(--muted-foreground)] mb-6">
              {T.expertise.infraLabel}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {infraStack.map((item, i) => (
                <StackItem key={item.label} {...item} index={i + 4} />
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-sm text-[var(--muted-foreground)] leading-relaxed border-l-2 border-[var(--accent)] pl-4"
            >
              {T.expertise.selfHostingBefore}{" "}
              <span className="text-[var(--foreground)]">{T.expertise.selfHostingHighlight}</span>
              {T.expertise.selfHostingAfter}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
