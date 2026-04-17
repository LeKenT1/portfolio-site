import { TranslationProvider } from "@/i18n/context";
import { Nav } from "@/components/nav/Nav";
import { Hero } from "@/components/hero/Hero";
import { Projects } from "@/components/projects/Projects";
import { Expertise } from "@/components/expertise/Expertise";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/footer/Footer";

export default function HomePage() {
  return (
    <TranslationProvider>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <section id="expertise">
          <Expertise />
        </section>
<Contact />
      </main>
      <Footer />
    </TranslationProvider>
  );
}
