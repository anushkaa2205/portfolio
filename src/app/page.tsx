import Hero from "@/components/sections/Hero";
import Philosophy from "@/components/sections/Philosophy";
import Stack from "@/components/sections/Stack";
import Work from "@/components/sections/Work";
import Contact from "@/components/sections/Contact";
import VeilRemover from "@/components/VeilRemover";

export default function Home() {
  return (
    <main>
      <VeilRemover />
      <Hero />
      <Philosophy />
      <Stack />
      <Work />
      <Contact />
    </main>
  );
}
