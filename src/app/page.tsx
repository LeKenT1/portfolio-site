import { TranslationProvider } from "@/i18n/context";
import { Nav } from "@/components/nav/Nav";
import { Hero } from "@/components/hero/Hero";
import { Projects } from "@/components/projects/Projects";
import { Expertise } from "@/components/expertise/Expertise";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/footer/Footer";
import { SectionProvider } from "@/components/scroll-zoom/SectionProvider";
import { ScrollZoomScroller } from "@/components/scroll-zoom/ScrollZoomScroller";

const SECTION_IDS = ["hero", "projects", "expertise", "contact"];

const sections = [
  {
    id: "hero",
    content: <Hero />,
  },
  {
    id: "projects",
    content: <Projects />,
  },
  {
    id: "expertise",
    content: (
      <section id="expertise">
        <Expertise />
      </section>
    ),
  },
  {
    id: "contact",
    content: (
      <>
        <Contact />
        <Footer />
      </>
    ),
  },
];

export default function HomePage() {
  return (
    <TranslationProvider>
      <SectionProvider sectionIds={SECTION_IDS}>
        <Nav />
        <ScrollZoomScroller sections={sections} />
      </SectionProvider>
    </TranslationProvider>
  );
}
