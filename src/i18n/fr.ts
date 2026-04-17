import type { Translations } from "./types";

export const fr: Translations = {
  nav: {
    projects: "Projets",
    stack: "Stack",
contact: "Contact",
    langSwitch: "EN",
  },
  hero: {
    available: "Disponible pour de nouveaux projets",
    subtitleBefore: "2 ans d'expérience.",
    subtitleHighlight: "Spécialisé dans la livraison ultra-rapide de MVPs",
    subtitleAfter: "avec des stacks modernes et des workflows IA.",
    credential0: "2 ans chez Xefi — Développeur Frontend (2023–2025)",
    credential1: "Concepteur Développeur d'Applications — DevOps",
    credential2: "France",
    ctaProjects: "Voir les projets",
    ctaContact: "Me contacter",
    scroll: "Scroll",
    generativeField: "Generative Field",
    reactsTo: "Réagit au curseur",
  },
  projects: {
    label: "Projets sélectionnés",
    title: "Projets livrés.",
    description:
      "Chaque projet représente une montée en complexité délibérée et une maîtrise architecturale croissante.",
    githubLink: "Plus de projets sur GitHub",
    geolearn: {
      highlight: "Vanilla JS SPA Mastery",
      accentLabel: "01 / Foundations",
      description:
        "Carte du monde interactive construite de zéro, avec un routeur hash personnalisé et un système i18n sans frameworks ni bundlers.",
    },
    mykorean: {
      highlight: "React 19 & Inputs complexes",
      accentLabel: "02 / Frontend",
      description:
        "Application d'apprentissage du coréen avec clavier Hangul virtuel, synthèse vocale et gestion d'état native via Context API.",
    },
    budget: {
      highlight: "Next.js 15 & Prisma ORM",
      accentLabel: "03 / Fullstack",
      description:
        "Outil de gestion financière complet avec authentification robuste, modélisation de base de données et visualisation de données.",
    },
  },
  expertise: {
    label: "Infrastructure",
    title: "Expertise & Stack.",
    devLabel: "Development Stack",
    infraLabel: "Infrastructure & Self-hosting",
    selfHostingBefore:
      "Expertise dans le déploiement et la gestion d'infrastructures auto-hébergées pour la",
    selfHostingHighlight: "souveraineté et confidentialité des données",
    selfHostingAfter:
      ". Services de niveau production sans dépendance aux fournisseurs cloud.",
  },
  contact: {
    label: "Contact",
    title: "Construisons quelque chose.",
    description:
      "Ouvert aux projets freelance, collaborations et opportunités full-time dans des équipes orientées produit.",
    formName: "Nom",
    formEmail: "Email",
    formMessage: "Message",
    formNamePlaceholder: "Votre nom",
    formEmailPlaceholder: "vous@domaine.com",
    formMessagePlaceholder: "De quoi voulez-vous parler ?",
    formSend: "Envoyer",
    formSending: "Envoi...",
    formSuccessTitle: "Message envoyé.",
    formSuccessBody: "Je vous répondrai dans les 24 heures.",
    formErrorFallback: "Une erreur est survenue. Réessayez.",
    formErrorRequired: "Ce champ est requis.",
    formErrorInvalid: "Email invalide.",
    formErrorTooShort: "Minimum 10 caractères.",
  },
};
