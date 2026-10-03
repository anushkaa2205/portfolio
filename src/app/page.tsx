import Hero from "@/components/sections/Hero";
import Aperture from "@/components/Aperture";
import Archive from "@/components/sections/Archive";
import About from "@/components/sections/About";
import Philosophy from "@/components/sections/Philosophy";
import BeyondCode from "@/components/sections/BeyondCode";
import Contact from "@/components/sections/Contact";
import VeilRemover from "@/components/VeilRemover";

export default function Home() {
  return (
    <main>
      <VeilRemover />
      <Hero />
      <Aperture />
      <Archive />
      <About />
      <Philosophy />
      <BeyondCode />
      <Contact />
    </main>
  );
}
