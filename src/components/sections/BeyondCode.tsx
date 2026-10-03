"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

export default function BeyondCode() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".bc-in", {
        y: 24,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 85%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="beyond-code"
      className="relative border-t border-line px-5 py-20 sm:px-10"
      data-eclipse='{"x":0.9,"y":0.3,"r":0.06,"phase":1.3,"o":0}'
    >
      <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
        <span className="mono bc-in text-accent">05 — Beyond code</span>
        <p className="disp-500 bc-in text-bone" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
          {site.beyondCode}
        </p>
      </div>
    </section>
  );
}
