import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Work } from "@/components/Work";
import { Skills } from "@/components/Skills";
import { Education } from "@/components/Education";
import { Contact } from "@/components/Contact";
import { Divider } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLd />
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Divider />
        <Experience />
        <Divider />
        <Work />
        <Divider />
        <Skills />
        <Divider />
        <Education />
        <Contact />
      </main>
    </>
  );
}
