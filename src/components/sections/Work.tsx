"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { visibleProjects } from "@/data/projects";
import Image from "next/image";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const statusLabel = { live: "Live", "in-progress": "In progress", archived: "Archived" } as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The rail: cream cards on the dark page.
 *
 * Projects run horizontally under a sticky viewport, one card per screen, with a progress
 * line and a live index. Each card is the whole story — screenshot, what it does, the
 * problem, the stack, the role and both links — so nothing ever has to be opened. The
 * active card drives its own reveal through [data-active] in CSS rather than a tween per
 * card: one scroll listener total.
 *
 * The section itself stays on the dark page; only the cards are bone, so each project
 * sits on it like a printed sheet.
 *
 * Below 1100px the whole thing degrades to a plain vertical stack; no pinning, no
 * horizontal scroll, everything visible.
 */
export default function Work() {
  const root = useRef<HTMLElement>(null);
  const n = visibleProjects.length;

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1100px)", () => {
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
            if (count) count.textContent = pad(i + 1);
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
      className="rail-stage relative bg-ink-2 text-bone"
      style={{ "--rail-h": `${n * 100}svh` } as CSSProperties}
    >
      <div className="rail-sticky flex flex-col overflow-hidden">
        <div className="wk-head mono flex items-center justify-between px-5 pt-24 sm:px-10">
          <span className="text-accent">02 — Work</span>
          <span className="text-dim">
            <span className="rail-count">01</span> / {pad(n)}
          </span>
        </div>

        <div className="rail-track">
          {visibleProjects.map((p, i) => {
            const next = visibleProjects[i + 1];
            const where = p.links.live ?? p.links.github;
            const host = where ? where.replace(/^https?:\/\//, "").replace(/\/$/, "") : null;
            return (
              <article
                key={p.slug}
                id={`project-${p.slug}`}
                data-active={i === 0 ? "true" : "false"}
                className="rail-panel relative"
                aria-labelledby={`project-${p.slug}-title`}
              >
                <div className="wk-wrap mx-auto flex h-full w-full max-w-[1320px] px-5 sm:px-10">
                  <div className="wk-card">
                    {/* the card's own strip: number, year, status — the way every card is labelled */}
                    <div className="wk-strip rail-fade mono">
                      <span>
                        <span className="wk-blue">{pad(i + 1)}</span>
                        <span className="text-ink/40"> / {pad(n)}</span>
                        <span className="text-ink/40"> — {p.year}</span>
                      </span>
                      <span className="wk-rule" aria-hidden="true" />
                      <span className="wk-status">
                        <span className={`wk-dot wk-dot-${p.status}`} aria-hidden="true" />
                        {statusLabel[p.status]}
                      </span>
                    </div>

                    <div className="wk-body">
                      <figure className="wk-figure">
                        {p.cover ? (
                          <div className="wk-shot rail-shot">
                            <Image
                              src={p.cover}
                              alt={`${p.title} — screenshot of the interface`}
                              fill
                              sizes="(max-width: 768px) 100vw, 56vw"
                              className="rail-shot-img"
                              priority={i === 0}
                            />
                          </div>
                        ) : null}
                        <figcaption className="wk-caption rail-fade mono">
                          <span className="flex-none text-ink/40">Fig. {pad(i + 1)}</span>
                          {host ? <span className="wk-host">{host}</span> : null}
                        </figcaption>
                      </figure>

                      <div className="wk-info">
                        <h3 id={`project-${p.slug}-title`} className="rail-title wk-title disp">
                          <span className="mask">
                            <span className="rail-solid">{p.title}</span>
                          </span>
                          <span className="rail-ghost" aria-hidden="true">
                            {p.title}
                          </span>
                        </h3>

                        <p className="wk-summary rail-fade">{p.summary}</p>

                        <div className="wk-problem rail-fade">
                          <span className="mono wk-blue">The problem</span>
                          <p>{p.caseStudy.problem}</p>
                        </div>

                        <dl className="wk-meta rail-fade mono">
                          <div>
                            <dt>Role</dt>
                            <dd>{p.role}</dd>
                          </div>
                        </dl>

                        <ul className="wk-stack rail-fade mono" aria-label="Built with">
                          {p.stack.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>

                        <div className="wk-actions rail-fade">
                          {p.links.live ? (
                            <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="wk-btn wk-btn-solid mono">
                              Live demo <span aria-hidden="true">↗</span>
                              <span className="sr-only"> for {p.title} (opens in a new tab)</span>
                            </a>
                          ) : (
                            <span className="wk-btn wk-btn-off mono" aria-disabled="true">
                              Live demo — not deployed
                            </span>
                          )}
                          {p.links.github ? (
                            <a href={p.links.github} target="_blank" rel="noopener noreferrer" className="wk-btn wk-btn-line mono">
                              GitHub <span aria-hidden="true">↗</span>
                              <span className="sr-only"> for {p.title} (opens in a new tab)</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {next ? (
                  <span className="rail-next mono pointer-events-none hidden min-[1100px]:block" aria-hidden="true">
                    Next — {next.title}
                  </span>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="px-5 pb-8 sm:px-10">
          <div className="h-px w-full bg-line">
            <div className="rail-bar h-px w-full origin-left bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
