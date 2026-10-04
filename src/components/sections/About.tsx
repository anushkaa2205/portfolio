"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { about } from "@/data/about";
import { prefersReducedMotion } from "@/lib/scroll";
import { useLenis } from "@/components/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * About — the curiosity archive.
 *
 * An editorial portrait in three columns on the black. On the left, the opening statement
 * holds still (sticky) as the anchor of the whole section. In the middle, the story reads
 * down in four short subsections. On the right, a narrow numbered index tracks where you
 * are and moves you between them. A quiet strip closes it.
 *
 * Typography and rules only: no images, no cards. Motion reveals the composition once
 * (headline rising out of its masks, rules drawing in, text arriving in a short stagger)
 * and then gets out of the way of reading.
 *
 * Below 1100px the statement stops being sticky and sits on top; below 700px everything
 * stacks and the index becomes a compact bar under the nav.
 */
const SUBSECTIONS = [about.story, about.doing, about.values, about.learning];

function Fragment({ className }: { className: string }) {
  return (
    <p className={`ab-fragment mono ${className}`} aria-hidden="true">
      {about.fragment.map((line, i) => (
        <span key={i} className={line === "//" ? "text-accent" : undefined}>
          {line}
        </span>
      ))}
    </p>
  );
}

export default function About() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const [active, setActive] = useState(0);

  // Which part is being read: the last one whose top has passed a line 30% down the screen
  // (where a part lands after a jump from the index). Measured, not toggled, so a short
  // part can never be skipped over.
  useEffect(() => {
    const els = SUBSECTIONS.map((s) => document.getElementById(s.id));
    const pick = () => {
      const line = window.innerHeight * 0.3 + 1;
      let i = 0;
      els.forEach((el, k) => {
        if (el && el.getBoundingClientRect().top <= line) i = k;
      });
      setActive(i);
    };
    const st = ScrollTrigger.create({ trigger: root.current, start: "top bottom", end: "bottom top", onUpdate: pick, onRefresh: pick });
    return () => st.kill();
  }, []);

  // the entrance: once, and only to reveal what is already laid out
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: { trigger: root.current, start: "top 68%", once: true },
      });
      tl.from(".ab-line > span", { yPercent: 112, duration: 1.3, stagger: 0.09 }, 0)
        .from(".ab-rule-v", { scaleY: 0, duration: 1.4, ease: "expo.inOut", stagger: 0.12 }, 0.1)
        .from(".ab-rule-h", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0)
        .from(".ab-annot, .ab-lead .ab-fragment", { opacity: 0, y: 14, duration: 0.9, stagger: 0.08 }, 0.55)
        .from("#about-story [data-ab-in]", { opacity: 0, y: 22, duration: 1, stagger: 0.08 }, 0.4)
        .from(".ab-index li", { opacity: 0, x: 10, duration: 0.8, stagger: 0.06 }, 0.6)
        .from(".ab-dot", { scale: 0, duration: 0.6, ease: "back.out(3)" }, 1.0);

      // the later subsections arrive as they are reached: a little rise, nothing more
      for (const id of ["#about-doing", "#about-values", "#about-learning"]) {
        gsap.from(`${id} [data-ab-in]`, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: id, start: "top 78%", once: true },
        });
      }
      gsap.from(".ab-seq span", {
        opacity: 0.15,
        duration: 0.5,
        stagger: 0.18,
        ease: "power1.out",
        scrollTrigger: { trigger: ".ab-seq", start: "top 85%", once: true },
      });
      gsap.from(".ab-strip li", {
        opacity: 0,
        y: 10,
        duration: 0.8,
        stagger: 0.06,
        ease: "expo.out",
        scrollTrigger: { trigger: ".ab-strip", start: "top 92%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, i: number) => {
    const el = document.getElementById(SUBSECTIONS[i].id);
    if (!el) return;
    e.preventDefault();
    setActive(i);
    // it lands just under the nav (and the index bar on phones): Lenis and scrollIntoView
    // both honour the subsection's scroll-margin-top, so the gap is set once, in CSS
    if (lenis) lenis.scrollTo(el, { duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  };

  return (
    <section ref={root} id="about" className="ab" aria-labelledby="about-title">
      <header className="ab-head mono">
        <span className="text-accent">{about.label}</span>
        <span className="text-dim">{about.aside}</span>
        <span className="ab-rule-h" aria-hidden="true" />
      </header>

      <div className="ab-grid">
        {/* — the opening statement — */}
        <div className="ab-lead">
          <h2 id="about-title" className="ab-headline disp">
            {about.headline.map((line, i) => (
              <span key={line} className={`ab-line ${i === about.headline.length - 1 ? "text-accent" : ""}`}>
                <span>{line}</span>
              </span>
            ))}
          </h2>

          <p className="ab-annot mono">
            {about.annotation.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>

          <Fragment className="ab-fragment-lead" />
        </div>

        {/* — the story, in four short parts — */}
        <div className="ab-story">
          <span className="ab-rule-v ab-rule-story" aria-hidden="true" />

          <section id={about.story.id} className="ab-sub" tabIndex={-1} aria-labelledby={`${about.story.id}-h`}>
            <h3 id={`${about.story.id}-h`} className="ab-sublabel mono" data-ab-in>
              {about.story.index}
            </h3>
            <p className="ab-opening" data-ab-in>
              {about.story.opening}
            </p>
            <p className="ab-intro" data-ab-in>
              {about.story.intro}
            </p>
            <div className="ab-exploring" data-ab-in>
              <span className="mono text-dim">[ {about.story.exploringLabel} ]</span>
              <ul className="ab-tags mono">
                {about.story.exploring.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id={about.doing.id} className="ab-sub" tabIndex={-1} aria-labelledby={`${about.doing.id}-h`}>
            <h3 id={`${about.doing.id}-h`} className="ab-sublabel mono" data-ab-in>
              {about.doing.index}
            </h3>
            <ol className="ab-rows">
              {about.doing.rows.map((r, i) => (
                <li key={r.label} className="ab-row" data-ab-in>
                  <span className="ab-row-num disp" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span className="ab-row-label disp-500">{r.label}</span>
                  <span className="ab-row-text">{r.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section id={about.values.id} className="ab-sub" tabIndex={-1} aria-labelledby={`${about.values.id}-h`}>
            <h3 id={`${about.values.id}-h`} className="ab-sublabel mono" data-ab-in>
              {about.values.index}
            </h3>
            <ol className="ab-values">
              {about.values.items.map((v, i) => (
                <li key={v.title} className="ab-value" data-ab-in>
                  <span className="ab-value-num disp" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <div>
                    <p className="ab-value-title disp-500">
                      {v.title.slice(0, -1)}
                      <span className="text-accent">{v.title.slice(-1)}</span>
                    </p>
                    <p className="ab-value-text">{v.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id={about.learning.id} className="ab-sub ab-sub-last" tabIndex={-1} aria-labelledby={`${about.learning.id}-h`}>
            <h3 id={`${about.learning.id}-h`} className="ab-sublabel mono" data-ab-in>
              {about.learning.index}
            </h3>
            <p className="ab-statement disp-500" data-ab-in>
              {about.learning.statement}
            </p>
            <p className="ab-intro" data-ab-in>
              {about.learning.text}
            </p>
            <p className="ab-seq mono" data-ab-in>
              {about.learning.sequence.map((w, i) => (
                <span key={w}>
                  {i > 0 ? <i aria-hidden="true">/</i> : null}
                  {w}
                </span>
              ))}
            </p>
          </section>

          <Fragment className="ab-fragment-end" />
        </div>

        {/* — the index: where you are, and a way between the parts — */}
        <nav className="ab-index" aria-label="About me">
          <span className="ab-rule-v ab-rule-index" aria-hidden="true" />
          <ol>
            {SUBSECTIONS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, i)}
                  className="ab-index-link mono"
                  aria-current={active === i ? "true" : undefined}
                >
                  <span className="ab-dot" aria-hidden="true" />
                  <span className="ab-index-num">{pad(i + 1)}</span>
                  <span className="ab-index-dash" aria-hidden="true">
                    —
                  </span>
                  <span className="ab-index-name">{s.index}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* — the closing signature — */}
      <ol className="ab-strip mono" aria-label="Build, learn, solve, repeat">
        {about.strip.map((w, i) => (
          <li key={w}>
            <span className="text-dim">{pad(i + 1)}</span>
            <span className="ab-strip-word disp-500">{w}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
