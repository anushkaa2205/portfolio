import Hero from "@/components/sections/Hero";
import Aperture from "@/components/Aperture";
import Work from "@/components/sections/Work";
import Philosophy from "@/components/sections/Philosophy";
import Stack from "@/components/sections/Stack";
import BeyondCode from "@/components/sections/BeyondCode";
import Contact from "@/components/sections/Contact";
import VeilRemover from "@/components/VeilRemover";

export default function Home() {
  return (
    <main>
      <VeilRemover />
      <Hero />
      <Aperture />
      <Work />
      <Philosophy />
      <Stack />
      <BeyondCode />
      <Contact />
    </main>
  );
}
