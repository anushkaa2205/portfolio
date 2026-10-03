"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/** Splits the manifesto into words; the accent phrase(s) keep their colour, the rest light up on scroll. */
function useWords() {
  return site.manifesto.map((line) => {
    const words: { text: string; accent: boolean }[] = [];
    let rest = line;
    while (rest.length) {
      const hit = site.manifestoAccent
        .map((a) => ({ a, i: rest.indexOf(a) }))
        .filter((h) => h.i >= 0)
        .sort((p, q) => p.i - q.i)[0];
      if (!hit) {
        rest.split(" ").filter(Boolean).forEach((w) => words.push({ text: w, accent: false }));
        break;
      }
      rest
        .slice(0, hit.i)
        .split(" ")
        .filter(Boolean)
        .forEach((w) => words.push({ text: w, accent: false }));
      words.push({ text: hit.a, accent: true });
      rest = rest.slice(hit.i + hit.a.length);
    }
    return words;
  });
}

export default function Philosophy() {
  const root = useRef<HTMLElement>(null);
  const lines = useWords();

  useEffect(() => {
    if (prefersReducedMotion()) {
      gsap.set(".ph-word", { color: "var(--bone)" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".ph-word:not(.ph-accent)",
        { color: "#3a3733" },
        {
          color: "#ede8e0",
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            // The section is tall and its content sticky, so the fill gets real scroll room.
            trigger: root.current,
            start: "top 35%",
            end: "bottom bottom",
            scrub: 0.6,
          },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="philosophy"
      className="relative"
      style={{ height: "260svh" }}
      data-eclipse='{"x":0.88,"y":0.36,"r":0.07,"phase":0.62,"o":1,"m":{"x":0.86,"y":0.15,"r":0.05}}'
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center px-5 py-28 sm:px-10">
      <div className="grid gap-10 md:grid-cols-[220px_1fr_220px]">
        <div className="mono flex flex-col gap-3">
          <span className="text-accent">04 — Philosophy</span>
        </div>

        <div className="ph-text disp-500 text-bone" style={{ fontSize: "clamp(28px, 3.6vw, 56px)", lineHeight: 1.15 }}>
          {lines.map((words, li) => (
            <p key={li} className="m-0">
              {words.map((w, wi) => (
                <span
                  key={wi}
                  className={`ph-word inline-block ${w.accent ? "ph-accent text-accent" : ""}`}
                  style={{ marginRight: "0.22em" }}
                >
                  {w.text}
                </span>
              ))}
            </p>
          ))}
        </div>

      </div>
      </div>
    </section>
  );
}
