import Hero from "@/components/sections/Hero";
import Aperture from "@/components/Aperture";
import Archive from "@/components/sections/Archive";
import About from "@/components/sections/About";
import BeyondCode from "@/components/sections/BeyondCode";
import Contact from "@/components/sections/Contact";
import VeilRemover from "@/components/VeilRemover";

export default function Home() {
  return (
    <main id="main">
      <VeilRemover />
      <Hero />
      <Aperture />
      <Archive />
      <About />
      <BeyondCode />
      <Contact />
    </main>
  );
}
