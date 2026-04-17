"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn("flex items-center gap-3", className)}
    >
      <span className="h-px w-6 bg-[var(--accent)]" />
      <span className="font-mono text-xs tracking-widest uppercase text-[var(--accent)]">
        {children}
      </span>
    </motion.div>
  );
}
