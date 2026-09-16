"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState, prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/**
 * One Lenis instance for the whole app, driven by GSAP's ticker so ScrollTrigger and
 * every scroll-linked animation read the same smoothed value on the same frame.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({
      lerp: 0.07,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      smoothWheel: true,
    });
    ref.current = instance;
    setLenis(instance);

    instance.on("scroll", (e: Lenis) => {
      scrollState.y = e.scroll;
      scrollState.velocity = e.velocity;
      scrollState.limit = e.limit || 1;
      scrollState.progress = e.limit ? e.scroll / e.limit : 0;
      ScrollTrigger.update();
    });

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      ref.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
