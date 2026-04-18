import type { Translations } from "./types";

export const en: Translations = {
  nav: {
    projects: "Projects",
    stack: "Stack",
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
    label: "AI Workflow",
    title: "AI-augmented development.",
    subtitle: "I use AI as a force multiplier — not a replacement. Every line of generated code is reviewed, understood, and owned.",
    statProductivity: "Productivity gain",
    statCodeReviewed: "Code reviewed by a human",
    statBlackBox: "Black-box code shipped",
    principles: [
      { title: "Speed without shortcuts", body: "AI accelerates boilerplate and scaffolding, freeing focus for architecture and product decisions." },
      { title: "Full ownership", body: "Every AI-generated line is read, tested, and understood before it ships. No copy-paste blindness." },
      { title: "Context-aware prompting", body: "Precise prompts scoped to the codebase produce reliable outputs — not generic suggestions." },
      { title: "Iterative refinement", body: "AI outputs are a first draft. Domain knowledge and code review turn them into production-grade code." },
    ],
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
