"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { site } from "@/data/site";
import { scrollState, prefersReducedMotion } from "@/lib/scroll";

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const ghosts = useRef<HTMLDivElement[]>([]);
  const [copied, setCopied] = useState(false);

  // Ghost outlines trail the solid headline by scroll velocity — pure transform, every frame.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const state = { v: 0 };
    const tick = () => {
      // ease towards the live velocity so the trail settles instead of snapping
      state.v += (scrollState.velocity - state.v) * 0.12;
      const v = Math.max(-24, Math.min(24, state.v));
      const step = Math.min(26, window.innerWidth * 0.018);
      ghosts.current.forEach((g, i) => {
        const k = (i + 1) * 0.55;
        g.style.transform = `translate3d(0, ${-(i + 1) * step - v * k}px, 0) skewY(${(-v / 24) * 2.5 * k}deg)`;
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".ct-in", {
        y: 30,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  const links = [
    { label: "Email", href: `mailto:${site.email}`, meta: copied ? "copied ✓" : "click to copy", onClick: copy },
    { label: "GitHub", href: site.links.github, meta: "@anushkaa2205 ↗" },
    { label: "LinkedIn", href: site.links.linkedin, meta: "/in/anushka ↗" },
    { label: "Resume", href: site.links.resume, meta: "PDF ↓" },
  ];

  const headline = "Say hi";
  const size = "clamp(96px, 24vw, 460px)";

  return (
    <section
      ref={root}
      id="contact"
      className="relative flex min-h-svh flex-col overflow-hidden px-5 pb-8 pt-28 sm:px-10"
      data-eclipse='{"x":0.9,"y":0.3,"r":0.06,"phase":1.45,"o":1,"m":{"x":0.86,"y":0.46,"r":0.05}}'
    >
      <div className="mono ct-in flex items-center justify-between">
        <span className="flex gap-6">
          <span className="text-accent">06 — Contact</span>
          <span className="hidden text-dim sm:inline">The moon leaves</span>
        </span>
        <span className="hidden text-dim sm:inline">Replies within a day</span>
      </div>

      <div className="relative flex-1">
        {[0.16, 0.32, 0.55].map((o, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) ghosts.current[i] = el;
            }}
            aria-hidden="true"
            className="disp outline-text pointer-events-none absolute left-0 top-[16vh] select-none will-change-transform"
            style={{ fontSize: size, opacity: o, lineHeight: 0.8, transform: `translate3d(0, ${-(i + 1) * 0.055}em, 0)` }}
          >
            {headline}
          </div>
        ))}
        <h2 className="disp ct-in absolute left-0 top-[16vh] text-bone" style={{ fontSize: size, lineHeight: 0.8 }}>
          {headline}
          <span className="text-accent" style={{ fontSize: "0.28em", lineHeight: 1, verticalAlign: "baseline" }}>
            .
          </span>
        </h2>

        <ul className="absolute bottom-0 right-0 flex w-full max-w-[440px] flex-col">
          {links.map((l) => (
            <li key={l.label} className="ct-in border-b border-line last:border-b-0">
              <a
                href={l.href}
                onClick={l.onClick}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center justify-between py-5 text-xl transition-colors duration-500 hover:text-accent sm:text-[22px]"
              >
                <span>{l.label}</span>
                <span className="mono text-dim transition-colors duration-500 group-hover:text-bone">{l.meta}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mono ct-in mt-8 flex flex-col gap-2 border-t border-line pt-5 text-dim sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} {site.name} · Next.js · GSAP · Lenis · Three.js
        </span>
        <span>{site.location}</span>
      </div>
    </section>
  );
}
