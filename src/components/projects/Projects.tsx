"use client";

import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { ProjectCard, ProjectData } from "./ProjectCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useTranslation } from "@/i18n/context";

export function Projects() {
  const { T } = useTranslation();
  const [activeId, setActiveId] = useState("geolearn");

  const projects: ProjectData[] = [
    {
      id: "geolearn",
      title: "GeoLearn — The Fundamentals",
      highlight: T.projects.geolearn.highlight,
      accentLabel: T.projects.geolearn.accentLabel,
      description: T.projects.geolearn.description,
      tags: ["Vanilla JS", "D3.js v7", "TopoJSON", "No-Build Architecture"],
      href: "#",
      images: Array.from({ length: 14 }, (_, i) => `/images/projects/geolearn-${i + 1}.png`),
    },
    {
      id: "mykorean",
      title: "MyKorean — Modern Frontend",
      highlight: T.projects.mykorean.highlight,
      accentLabel: T.projects.mykorean.accentLabel,
      description: T.projects.mykorean.description,
      tags: ["React 19", "TypeScript 5.8", "Vite 6", "Context API", "Web Speech API"],
      href: "#",
      images: Array.from({ length: 8 }, (_, i) => `/images/projects/mykorean-${i + 1}.png`),
    },
    {
      id: "budget",
      title: "Budget App — Fullstack Complexity",
      highlight: T.projects.budget.highlight,
      accentLabel: T.projects.budget.accentLabel,
      description: T.projects.budget.description,
      tags: ["Next.js 15 App Router", "Prisma", "NextAuth.js", "Tailwind v3", "Radix UI", "Recharts"],
      href: "#",
      images: Array.from({ length: 9 }, (_, i) => `/images/projects/budget-${i + 1}.png`),
    },
  ];

  const featured = projects.find((p) => p.id === activeId)!;
  const others = projects.filter((p) => p.id !== activeId);

  return (
    <section id="projects" className="relative py-24 sm:py-32 px-4 sm:px-8 lg:px-16 xl:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <SectionLabel>{T.projects.label}</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight"
            >
              {T.projects.title}
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="hidden sm:block text-sm text-[var(--muted-foreground)] max-w-xs text-right leading-relaxed"
          >
            {T.projects.description}
          </motion.p>
        </div>

        {/* Grid: featured (2/3) + sidebar (1/3) */}
        <LayoutGroup>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-start">
            {/* Featured card */}
            <div className="lg:col-span-2">
              <ProjectCard key={activeId} project={featured} isFeatured={true} />
            </div>

            {/* Sidebar — clickable previews */}
            <div className="lg:col-span-1 flex flex-col gap-4 lg:gap-5">
              {others.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isFeatured={false}
                  onSelect={() => setActiveId(project.id)}
                />
              ))}
            </div>
          </div>
        </LayoutGroup>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 font-mono text-xs text-[var(--border)] text-center tracking-widest uppercase"
        >
          {T.projects.githubLink}
        </motion.p>
      </div>
    </section>
  );
}
