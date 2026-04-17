import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "@/i18n/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lemaire Quentin — Full-stack Developer",
  description:
    "Développeur Full-stack spécialisé dans la livraison rapide de MVPs avec des stacks modernes et des workflows IA.",
  openGraph: {
    title: "Lemaire Quentin — Full-stack Developer",
    description:
      "2 ans d'expérience. Spécialisé dans la livraison ultra-rapide de MVPs avec des stacks modernes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <TranslationProvider>{children}</TranslationProvider>
      </body>
    </html>
  );
}
