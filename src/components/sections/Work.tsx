"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { visibleProjects } from "@/data/projects";
import CaseLink from "@/components/CaseLink";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const statusLabel = { live: "Live", "in-progress": "In progress", archived: "Archived" } as const;

/**
 * The rail.
 *
 * Projects run horizontally under a sticky viewport, one panel per screen, with a
 * progress line and a live index. The active panel drives its own reveal through
 * [data-active] in CSS rather than a tween per panel — one scroll listener total.
 *
 * Below 768px the whole thing degrades to a plain vertical stack; no pinning,
 * no horizontal scroll, everything visible.
 */
export default function Work() {
  const root = useRef<HTMLElement>(null);
  const n = visibleProjects.length;

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const el = root.current;
      const track = el?.querySelector<HTMLElement>(".rail-track");
      if (!el || !track) return;

      const bar = el.querySelector<HTMLElement>(".rail-bar");
      const count = el.querySelector<HTMLElement>(".rail-count");
      const panels = gsap.utils.toArray<HTMLElement>(".rail-panel", el);

      const tween = gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          // land on a whole project rather than resting between two half-panels
          snap: n > 1 ? { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, delay: 0.04, ease: "power2.inOut" } : undefined,
          onUpdate: (self) => {
            const i = Math.min(n - 1, Math.round(self.progress * (n - 1)));
            panels.forEach((p, idx) => {
              p.dataset.active = idx === i ? "true" : "false";
            });
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
            if (count) count.textContent = String(i + 1).padStart(2, "0");
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [n]);

  return (
    <section
      ref={root}
      id="work"
      className="rail-stage relative bg-ink-2"
      style={{ "--rail-h": `${n * 100}svh` } as CSSProperties}
    >
      <div className="rail-sticky flex flex-col overflow-hidden">
        <div className="mono flex items-center justify-between px-5 pt-24 sm:px-10">
          <span className="text-accent">02 — Work</span>
          <span className="text-dim">
            <span className="rail-count">01</span> / {String(n).padStart(2, "0")}
          </span>
        </div>

        <div className="rail-track">
          {visibleProjects.map((p, i) => (
            <article
              key={p.slug}
              data-active={i === 0 ? "true" : "false"}
              className="rail-panel flex flex-col justify-center px-5 sm:px-10"
            >
              <div className="mx-auto grid w-full max-w-[1180px] items-end gap-8 sm:grid-cols-[1fr_minmax(280px,400px)] sm:gap-14">
                <div>
                  <span className="rail-fade mono mb-6 block text-dim">
                    {String(i + 1).padStart(2, "0")} — {p.year}
                  </span>
                  <h3 className="rail-title disp text-bone" style={{ fontSize: "clamp(58px, 10.5vw, 176px)" }}>
                    <span className="mask">
                      <span className="rail-solid">{p.title}</span>
                    </span>
                    <span className="rail-ghost" aria-hidden="true">
                      {p.title}
                    </span>
                  </h3>
                </div>

                <div className="flex flex-col items-start gap-4 sm:items-end sm:text-right">
                  <span className="rail-fade mono text-dim">{p.stack.slice(0, 4).join(" · ")}</span>
                  <p className="rail-fade max-w-[420px] text-[15px] leading-relaxed text-bone-2 sm:text-base">
                    {p.summary}
                  </p>
                  <span className="rail-fade mono flex items-center gap-2 text-accent">
                    <span className={`status-dot status-${p.status}`} />
                    {statusLabel[p.status]}
                  </span>
                  <CaseLink
                    href={`/work/${p.slug}`}
                    className="rail-fade mono inline-flex items-center gap-3 border border-bone px-5 py-3.5 transition-colors duration-500 hover:bg-bone hover:text-ink"
                  >
                    Open case study <span aria-hidden="true">→</span>
                  </CaseLink>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="px-5 pb-10 sm:px-10">
          <div className="h-px w-full bg-line">
            <div className="rail-bar h-px w-full origin-left bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
