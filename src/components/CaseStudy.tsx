"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Project } from "@/data/projects";
import { visibleProjects } from "@/data/projects";
import CaseLink from "./CaseLink";
import VeilRemover from "./VeilRemover";
import { prefersReducedMotion } from "@/lib/scroll";

const statusLabel = { live: "Live", "in-progress": "In progress", archived: "Archived" } as const;

export default function CaseStudy({ project, index, next }: { project: Project; index: number; next: Project }) {
  const root = useRef<HTMLElement>(null);
  const p = project;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.25 });
      tl.from(".cs-title .mask > *", { yPercent: 110, duration: 1.3, stagger: 0.08 })
        .from(".cs-in", { y: 24, opacity: 0, duration: 1, stagger: 0.06 }, "-=0.9");
    }, root);
    return () => ctx.revert();
  }, [p.slug]);

  const blocks = [
    { label: "The problem", text: p.caseStudy.problem },
    { label: "What I built", text: p.caseStudy.built },
    { label: "The hard part", text: p.caseStudy.hardPart },
    ...(p.caseStudy.outcome ? [{ label: "Outcome", text: p.caseStudy.outcome }] : []),
  ];

  return (
    <main ref={root} className="relative px-5 pb-16 pt-28 sm:px-10">
      <VeilRemover />

      <header
        className="relative flex min-h-[70svh] flex-col"
      >
        <div className="mono cs-in flex items-center justify-between">
          <CaseLink href="/#work" className="link-line">
            ← All work
          </CaseLink>
          <span className="text-dim">
            {String(index + 1).padStart(2, "0")} / {String(visibleProjects.length).padStart(2, "0")}
          </span>
        </div>

        <h1 className="cs-title disp mt-auto text-bone" style={{ fontSize: "clamp(72px, 14vw, 200px)", lineHeight: 0.82 }}>
          {p.title.split(" ").map((w, i) => (
            <span key={i} className="mask">
              <span>{w}</span>
            </span>
          ))}
        </h1>

        <div className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-4">
          <div className="cs-in flex flex-col gap-2">
            <span className="mono text-dim">Year</span>
            <span className="text-bone-2">{p.year}</span>
          </div>
          <div className="cs-in flex flex-col gap-2">
            <span className="mono text-dim">Status</span>
            <span className="mono flex items-center gap-2 text-accent"><span className={`status-dot status-${p.status}`} />{statusLabel[p.status]}</span>
          </div>
          <div className="cs-in flex flex-col gap-2 sm:col-span-2">
            <span className="mono text-dim">Role</span>
            <span className="text-bone-2">{p.role}</span>
          </div>
        </div>
      </header>

      <p className="cs-in mt-16 max-w-[720px] text-xl leading-relaxed text-bone sm:text-2xl">{p.summary}</p>

      <div className="mt-16 flex flex-col">
        {blocks.map((b) => (
          <section key={b.label} className="cs-in grid gap-4 border-t border-line py-10 sm:grid-cols-[220px_1fr] sm:gap-10">
            <h2 className="mono text-accent">{b.label}</h2>
            <p className="max-w-[720px] text-[17px] leading-[1.6] text-bone-2">{b.text}</p>
          </section>
        ))}

        <section className="cs-in grid gap-4 border-t border-line py-10 sm:grid-cols-[220px_1fr] sm:gap-10">
          <h2 className="mono text-accent">Stack</h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-2">
            {p.stack.map((s) => (
              <li key={s} className="mono border border-line px-3 py-2 text-bone-2">
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section className="cs-in grid gap-4 border-y border-line py-10 sm:grid-cols-[220px_1fr] sm:gap-10">
          <h2 className="mono text-accent">Links</h2>
          <div className="flex flex-wrap gap-4">
            {p.links.github && (
              <a
                href={p.links.github}
                target="_blank"
                rel="noreferrer"
                className="mono inline-flex items-center gap-3 border border-bone px-5 py-3.5 transition-colors duration-500 hover:bg-bone hover:text-ink"
              >
                GitHub ↗
              </a>
            )}
            {p.links.live && (
              <a
                href={p.links.live}
                target="_blank"
                rel="noreferrer"
                className="mono inline-flex items-center gap-3 border border-line px-5 py-3.5 text-bone-2 transition-colors duration-500 hover:border-bone hover:text-bone"
              >
                Live ↗
              </a>
            )}
          </div>
        </section>
      </div>

      <CaseLink href={`/work/${next.slug}`} className="group mt-16 flex flex-col gap-3">
        <span className="mono text-dim">Next project</span>
        <span
          className="disp text-bone transition-colors duration-500 group-hover:text-accent"
          style={{ fontSize: "clamp(56px, 10vw, 140px)", lineHeight: 0.85 }}
        >
          {next.title} →
        </span>
      </CaseLink>
    </main>
  );
}
