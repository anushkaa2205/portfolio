"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { visibleProjects } from "@/data/projects";
import CaseLink from "@/components/CaseLink";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

const statusLabel = { live: "Live", "in-progress": "In progress", archived: "Archived" } as const;

export default function Work() {
  const root = useRef<HTMLElement>(null);
  const [featured, ...rest] = visibleProjects;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".wk-title .mask > *", {
        yPercent: 110,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".wk-title", start: "top 85%" },
      });
      gsap.from(".wk-meta", {
        y: 24,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".wk-title", start: "top 85%" },
      });
      gsap.from(".wk-card", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".wk-grid", start: "top 88%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="work"
      className="relative"
      data-eclipse='{"x":0.5,"y":0.45,"r":0.19,"phase":1,"o":1,"m":{"y":0.4,"r":0.2}}'
    >
      {/* featured — totality */}
      <div className="relative flex min-h-svh flex-col bg-ink-2 px-5 pb-10 pt-28 sm:px-10">
        <div className="mono flex items-center justify-between">
          <span className="flex gap-6">
            <span className="text-accent">03 — Work</span>
            <span className="text-dim">Totality</span>
          </span>
          <span className="text-dim">01 / {String(visibleProjects.length).padStart(2, "0")}</span>
        </div>

        <div className="mt-auto grid items-end gap-8 pt-[38vh] sm:grid-cols-[1fr_minmax(280px,400px)] sm:gap-12">
          <h2 className="wk-title disp text-bone" style={{ fontSize: "clamp(72px, 12vw, 168px)", lineHeight: 0.82 }}>
            {featured.title.split(" ").map((w, i) => (
              <span key={i} className="mask">
                <span>{w}</span>
              </span>
            ))}
          </h2>
          <div className="flex flex-col items-start gap-4 sm:items-end sm:text-right">
            <span className="wk-meta mono text-dim">
              {featured.stack.slice(0, 4).join(" · ")} · {featured.year}
            </span>
            <p className="wk-meta max-w-[400px] text-[15px] leading-relaxed text-bone-2 sm:text-base">
              {featured.summary}
            </p>
            <span className="wk-meta mono flex items-center gap-2 text-accent"><span className={`status-dot status-${featured.status}`} />{statusLabel[featured.status]}</span>
            <CaseLink
              href={`/work/${featured.slug}`}
              className="wk-meta mono inline-flex items-center gap-3 border border-bone px-5 py-3.5 transition-colors duration-500 hover:bg-bone hover:text-ink"
            >
              Open case study <span aria-hidden="true">→</span>
            </CaseLink>
          </div>
        </div>
      </div>

      {/* the rest */}
      <div
        className="wk-grid grid gap-x-8 gap-y-12 px-5 py-12 sm:grid-cols-3 sm:px-10 sm:py-14"
        data-eclipse='{"x":0.9,"y":0.3,"r":0.06,"phase":1.2,"o":0,"m":{"x":0.86,"y":0.46,"r":0.05}}'
      >
        {rest.map((p, i) => (
          <CaseLink
            key={p.slug}
            href={`/work/${p.slug}`}
            origin="pointer"
            className="wk-card group flex flex-col gap-4 border-t border-line pt-5"
          >
            <div className="mono flex items-center justify-between text-dim">
              <span>{String(i + 2).padStart(2, "0")}</span>
              <span>{p.year}</span>
            </div>
            <h3
              className="disp text-bone transition-colors duration-500 group-hover:text-accent"
              style={{ fontSize: "clamp(40px, 4.2vw, 56px)", lineHeight: 0.9 }}
            >
              {p.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-bone-2">{p.summary}</p>
            <div className="mono mt-auto flex items-center justify-between pt-2 text-dim">
              <span>{p.stack.slice(0, 3).join(" · ")}</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </div>
          </CaseLink>
        ))}
      </div>
    </section>
  );
}
