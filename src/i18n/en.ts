import type { Translations } from "./types";

export const en: Translations = {
  nav: {
    projects: "Projects",
    stack: "Stack",
    process: "Process",
    contact: "Contact",
    langSwitch: "FR",
  },
  hero: {
    available: "Open to new projects",
    subtitleBefore: "2 years of experience.",
    subtitleHighlight: "Specialized in ultra-fast MVP delivery",
    subtitleAfter: "with modern stacks and AI-powered workflows.",
    credential0: "2 years at Xefi — Frontend Developer (2023–2025)",
    credential1: "Application Developer Designer — DevOps",
    credential2: "France",
    ctaProjects: "See projects",
    ctaContact: "Contact me",
    scroll: "Scroll",
    generativeField: "Generative Field",
    reactsTo: "Reacts to cursor",
  },
  projects: {
    label: "Selected projects",
    title: "Delivered projects.",
    description:
      "Each project represents a deliberate increase in complexity and growing architectural mastery.",
    githubLink: "More projects on GitHub",
    geolearn: {
      highlight: "Vanilla JS SPA Mastery",
      accentLabel: "01 / Foundations",
      description:
        "Built an interactive World Map Quiz from scratch, implementing a custom hash-based router and i18n system without frameworks or bundlers.",
    },
    mykorean: {
      highlight: "React 19 & Complex Inputs",
      accentLabel: "02 / Frontend",
      description:
        "Developed a language learning app featuring a custom virtual Hangul keyboard, speech synthesis for pronunciation, and native state management via Context API.",
    },
    budget: {
      highlight: "Next.js 15 & Prisma ORM",
      accentLabel: "03 / Fullstack",
      description:
        "Engineered a comprehensive financial management tool with robust authentication, database modeling, and sophisticated data visualization.",
    },
  },
  expertise: {
    label: "Infrastructure",
    title: "Expertise & Stack.",
    devLabel: "Development Stack",
    infraLabel: "Infrastructure & Self-hosting",
    selfHostingBefore:
      "Expertise in deploying and managing self-hosted infrastructure for",
    selfHostingHighlight: "data sovereignty and privacy",
    selfHostingAfter:
      ". Running production-grade services without cloud vendor lock-in.",
  },
  ai: {
    label: "Methodology",
    title: "AI Workflow Philosophy.",
    subtitle:
      "AI tools accelerate execution — not replace judgment. The discipline is in knowing which decisions to delegate and which to own completely.",
    principles: [
      {
        title: "40x Throughput",
        body: "AI handles boilerplate, syntax scaffolding, and first-draft implementations — compressing days of work into hours.",
      },
      {
        title: "100% Code Ownership",
        body: "Every line reviewed, understood, and justified. AI is the co-pilot; architecture and logic decisions stay mine.",
      },
      {
        title: "Cursor + Claude",
        body: "Tight feedback loops with Cursor IDE and Claude as context-aware collaborators for in-editor generation and review.",
      },
      {
        title: "Structured Commits",
        body: "AI-assisted code still ships through the same rigorous review cycle: typed, tested, committed with intent.",
      },
    ],
    statProductivity: "Productivity gain",
    statCodeReviewed: "Code reviewed",
    statBlackBox: "Black-box commits",
  },
  contact: {
    label: "Contact",
    title: "Let's build something.",
    description:
      "Open to freelance projects, collaborations, and full-time opportunities in product-oriented teams.",
    formName: "Name",
    formEmail: "Email",
    formMessage: "Message",
    formNamePlaceholder: "Your name",
    formEmailPlaceholder: "you@domain.com",
    formMessagePlaceholder: "What's on your mind?",
    formSend: "Send Message",
    formSending: "Sending...",
    formSuccessTitle: "Message sent.",
    formSuccessBody: "I'll get back to you within 24 hours.",
    formErrorFallback: "Something went wrong. Try again.",
    formErrorRequired: "This field is required.",
    formErrorInvalid: "Valid email required.",
    formErrorTooShort: "Minimum 10 characters.",
  },
};
