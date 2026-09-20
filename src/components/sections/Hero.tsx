"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/lib/scroll";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".hero-letter", { yPercent: 110, duration: 1.4, stagger: 0.06 }, 0.2)
        .from(".hero-fade", { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.9)
        .from(".hero-last > *", { yPercent: 110, duration: 1.2 }, 1.0);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-svh flex-col overflow-hidden px-5 pb-8 pt-28 sm:px-10"
      data-eclipse='{"x":0.5,"y":0.54,"r":0.26,"phase":0.6,"o":1}'
    >
      {/* the name — sits *behind* the eclipse (z-10 < canvas z-20) */}
      <div className="pointer-events-none absolute inset-x-0 top-[18vh] z-10 flex justify-center sm:top-[16vh]">
        <h1
          className="disp flex text-bone"
          style={{ fontSize: "clamp(96px, 27vw, 400px)" }}
          aria-label={`${site.firstName} ${site.lastName}`}
        >
          {site.firstName.split("").map((ch, i) => (
            <span key={i} className="mask">
              <span className="hero-letter">{ch}</span>
            </span>
          ))}
        </h1>
      </div>

      <div className="relative z-10 mt-auto grid grid-cols-1 items-end gap-8 sm:grid-cols-[1fr_auto_auto] sm:gap-10">
        <div className="max-w-[420px]">
          <p className="mono hero-fade text-accent">{site.role}</p>
          <p className="hero-fade mt-3 text-[17px] leading-[1.5] text-bone-2 sm:text-lg">{site.tagline}</p>
          <p className="mono hero-fade mt-4 text-dim">{site.availability}</p>
        </div>

        <div className="mask hero-last sm:order-none">
          <span
            className="disp outline-text text-right"
            style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}
          >
            {site.lastName}
          </span>
        </div>

        <div className="mono hero-fade hidden flex-col items-end gap-3 text-dim sm:flex">
          <span>Scroll — the aperture opens</span>
          <span className="block h-12 w-px bg-bone/70" />
        </div>
      </div>
    </section>
  );
}
