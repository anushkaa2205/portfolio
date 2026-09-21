"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { visibleProjects } from "@/data/projects";
import Image from "next/image";
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
          {visibleProjects.map((p, i) => {
            const next = visibleProjects[i + 1];
            return (
              <article
                key={p.slug}
                data-active={i === 0 ? "true" : "false"}
                className="rail-panel relative"
              >
                <CaseLink
                  href={`/work/${p.slug}`}
                  origin="pointer"
                  className="rail-hit group block h-full w-full"
                >
                  <div className="mx-auto flex h-full w-full max-w-[1320px] flex-col justify-between gap-10 px-5 py-20 sm:px-10 md:py-24">
                    <div className="rail-fade mono flex items-center justify-between text-dim">
                      <span>
                        {String(i + 1).padStart(2, "0")} — {p.year}
                      </span>
                      <span className="flex items-center gap-2 text-accent">
                        <span className={`status-dot status-${p.status}`} />
                        {statusLabel[p.status]}
                      </span>
                    </div>

                    <div className="grid items-center gap-10 md:grid-cols-[1fr_1.05fr] md:gap-0">
                      <div className="relative z-10 md:pr-6">
                        <h3 className="rail-title disp text-bone" style={{ fontSize: "clamp(52px, 9vw, 168px)" }}>
                          <span className="mask">
                            <span className="rail-solid">{p.title}</span>
                          </span>
                          <span className="rail-ghost" aria-hidden="true">
                            {p.title}
                          </span>
                        </h3>
                        <p className="rail-fade mt-6 max-w-[440px] text-[15px] leading-relaxed text-bone-2 sm:text-base">
                          {p.summary}
                        </p>
                      </div>

                      {p.cover ? (
                        <figure className="rail-shot relative aspect-[16/9] w-full md:-ml-[6%] md:aspect-auto md:h-[56vh]">
                          <Image
                            src={p.cover}
                            alt={`${p.title} interface`}
                            fill
                            sizes="(max-width: 768px) 100vw, 58vw"
                            className="rail-shot-img"
                            priority={i === 0}
                          />
                        </figure>
                      ) : null}
                    </div>

                    <div className="rail-fade mono flex flex-wrap items-center justify-between gap-4 text-dim">
                      <span>{p.stack.slice(0, 4).join(" · ")}</span>
                      <span className="rail-cta inline-flex items-center gap-3 border border-bone px-5 py-3.5 text-bone transition-colors duration-500 group-hover:bg-bone group-hover:text-ink">
                        Open case study <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>
                </CaseLink>

                {next ? (
                  <span className="rail-next mono pointer-events-none hidden text-dim md:block" aria-hidden="true">
                    Next — {next.title}
                  </span>
                ) : null}
              </article>
            );
          })}
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
