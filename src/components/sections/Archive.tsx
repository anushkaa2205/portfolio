"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { visibleProjects, type Project } from "@/data/projects";
import { prefersReducedMotion } from "@/lib/scroll";
import { useLenis } from "@/components/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

const statusLabel = { live: "Live", "in-progress": "In progress", archived: "Archived" } as const;
const pad = (n: number) => String(n).padStart(2, "0");
const hostOf = (url?: string) => (url ? url.replace(/^https?:\/\//, "").replace(/\/$/, "") : null);

/**
 * The archive — ideas into things.
 *
 * An exhibition of the work rather than a list of it. A narrow catalogue index on the left;
 * one project at a time mounted on the black as a physical artifact, its name set enormous
 * and cropped behind it; and a cream panel cutting into the canvas with the readable story
 * and both links.
 *
 * Every project is mounted differently (see `artifact.treatment` in projects.ts), so moving
 * between them changes the object on display, not just the words in a template.
 *
 * Desktop with motion: a full-screen sticky stage. Scrolling the page walks through the
 * projects — each one owns an equal stretch of the scroll — and the index, prev/next and
 * arrow keys all just scroll to that stretch, so the scrollbar is always the truth and
 * nothing traps the wheel. Everywhere else (tablet, phone, reduced motion): a normal block
 * with a compact sticky selector and the artifact stacked in reading order.
 */
const PINNED = "(min-width: 1100px) and (prefers-reduced-motion: no-preference)";

function Plate({ p, i, n, on }: { p: Project; i: number; n: number; on: boolean }) {
  const t = p.artifact.treatment;
  const host = hostOf(p.links.live ?? p.links.github);
  return (
    <div
      className="ar-plate"
      data-t={t}
      data-initial={i === 0 ? "" : undefined}
      aria-hidden={!on}
    >
      {/* the name, enormous and cropped by the canvas: the wall text the artifact hangs on */}
      <span className="ar-giant disp" aria-hidden="true">
        {p.title}
      </span>

      <div className="ar-mount">
        {/*
          The light the artifact sits in: its own screenshot blurred out into the room, plus
          two lights in colours sampled from it. Shaped per treatment in CSS — a sea with a
          flare and one radar sweep for Udgam, a red safelight from below for Obscura, a wide
          blue-violet halo for Medora, a violet glow behind the page stack for SpecForge.
        */}
        <span
          className="ar-aura"
          aria-hidden="true"
          style={{ "--a1": p.artifact.aura[0], "--a2": p.artifact.aura[1] } as CSSProperties}
        >
          {p.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="ar-aura-img" src={p.cover} alt="" decoding="async" />
          ) : null}
          <span className="ar-aura-tint" />
          {t === "chart" ? <span className="ar-sweep" /> : null}
        </span>

        {/* project-specific staging, behind the screenshot */}
        {t === "chart" ? <span className="ar-deco ar-deco-chart" aria-hidden="true" /> : null}
        {t === "sheets" ? (
          <span className="ar-deco ar-deco-sheets" aria-hidden="true">
            <span />
            <span />
          </span>
        ) : null}

        <div className="ar-frame">
          <div className="ar-shot">
            {p.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.cover}
                alt={on ? `${p.title} — screenshot of the interface` : ""}
                decoding="async"
                loading={i === 0 ? "eager" : "lazy"}
              />
            ) : (
              <span className="ar-shot-blank disp">{p.title}</span>
            )}
          </div>
          {/* crop marks, the way a print is mounted for a show */}
          <span className="ar-tick ar-tick-tl" aria-hidden="true" />
          <span className="ar-tick ar-tick-tr" aria-hidden="true" />
          <span className="ar-tick ar-tick-bl" aria-hidden="true" />
          <span className="ar-tick ar-tick-br" aria-hidden="true" />
          <span className="ar-label ar-label-l mono" aria-hidden="true">
            Plate {pad(i + 1)} / {pad(n)} — {p.category}
          </span>
          {host ? (
            <span className="ar-label ar-label-r mono" aria-hidden="true">
              {host}
            </span>
          ) : null}
        </div>

        {t === "redact" && p.artifact.marks?.length ? (
          // what it strips, struck out — the words come from the project's own summary
          <ul className="ar-marks mono" aria-hidden="true">
            {p.artifact.marks.map((m) => (
              <li key={m}>
                <span>{m}</span>
                <i />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default function Archive() {
  const n = visibleProjects.length;
  const lenis = useLenis();
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const p = visibleProjects[index];

  const cur = useRef(0);
  const busy = useRef(false);
  const pending = useRef<number | null>(null);
  const reveal = useRef<number | null>(null);
  /** set while a click is scrolling the stage, so the in-between projects are not shown */
  const jumping = useRef<number | null>(null);
  const pinned = useRef(false);
  const stActive = useRef(false);
  const stRef = useRef<ScrollTrigger | null>(null);
  const goRef = useRef<(i: number) => void>(() => {});

  const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root.current);
  /** Plates differ in what they carry (only one has marks, two have no staging), so the
   *  timeline only addresses what is actually there. */
  const all = (el: Element, sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel));

  /** Move the marker in the index to the given entry. */
  const mark = useCallback((i: number, instant = false) => {
    const el = root.current;
    const btn = el?.querySelectorAll<HTMLElement>(".ar-idx")[i];
    const m = el?.querySelector<HTMLElement>(".ar-marker");
    if (!btn || !m) return;
    const props = { y: btn.offsetTop, height: btn.offsetHeight };
    if (instant || prefersReducedMotion()) gsap.set(m, props);
    else gsap.to(m, { ...props, duration: 0.7, ease: "expo.out" });
  }, []);

  /** Udgam's one radar sweep across its sea: once per arrival, never looping. */
  const sweep = useCallback((plate: Element) => {
    const s = plate.querySelector(".ar-sweep");
    if (!s || prefersReducedMotion()) return;
    gsap.killTweensOf(s);
    gsap.timeline()
      .fromTo(s, { rotation: -40, opacity: 0 }, { rotation: 320, duration: 2.8, ease: "power2.inOut" }, 0)
      .to(s, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0)
      .to(s, { opacity: 0, duration: 0.9, ease: "power1.in" }, 1.9);
  }, []);

  /** The coordinated change of artifact: picture, wall text, staging and panel together. */
  const go = useCallback((to: number) => {
    if (to < 0 || to >= n) return;
    if (busy.current) {
      pending.current = to;
      return;
    }
    const from = cur.current;
    if (to === from) return;
    busy.current = true;
    cur.current = to;
    mark(to);

    const plates = q(".ar-plate");
    const a = plates[from];
    const b = plates[to];
    const dir = to > from ? 1 : -1;
    const t = visibleProjects[to].artifact.treatment;

    const finish = () => {
      busy.current = false;
      const next = pending.current;
      pending.current = null;
      // a request that arrived mid-flight: play it now (through the ref, so go stays a plain callback)
      if (next !== null && next !== cur.current) goRef.current(next);
    };

    if (prefersReducedMotion()) {
      gsap.set(a, { autoAlpha: 0 });
      gsap.set(b, { autoAlpha: 1 });
      setIndex(to);
      finish();
      return;
    }

    const aShot = a.querySelector(".ar-shot");
    const bShot = b.querySelector(".ar-shot");
    const bImg = b.querySelector(".ar-shot img, .ar-shot-blank");
    const bMount = b.querySelector(".ar-mount");
    const tl = gsap.timeline({ onComplete: finish });

    // the panel's words step out first, so the new ones can come in on the new picture
    tl.to(q("[data-ar-in]"), { opacity: 0, y: -8, duration: 0.22, ease: "power2.in", stagger: 0.02 }, 0)
      .to(q(".ar-word"), { yPercent: -110, duration: 0.3, ease: "power3.in" }, 0);

    // outgoing: the picture is masked away in the direction of travel, its wall text slides off
    tl.to(aShot, { clipPath: dir > 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)", duration: 0.7, ease: "power3.inOut" }, 0)
      .to(all(a, ".ar-deco, .ar-marks, .ar-tick, .ar-label"), { opacity: 0, duration: 0.3, ease: "power1.in" }, 0)
      .to(all(a, ".ar-aura"), { opacity: 0, scale: 0.92, duration: 0.6, ease: "power2.in" }, 0)
      .to(a.querySelector(".ar-giant"), { xPercent: -6 * dir, opacity: 0, duration: 0.6, ease: "power2.in" }, 0)
      .set(a, { autoAlpha: 0 }, 0.72)
      .set(aShot, { clearProps: "clipPath" }, 0.72)
      .set(all(a, ".ar-deco, .ar-marks, .ar-tick, .ar-label, .ar-giant, .ar-aura"), { clearProps: "opacity,transform" }, 0.72);

    // incoming: unmasked from the other side, and it settles onto the wall in its own way
    tl.set(b, { autoAlpha: 1 }, 0.12)
      .fromTo(
        bShot,
        { clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.95, ease: "expo.inOut" },
        0.12,
      )
      .fromTo(bImg, { scale: 1.14 }, { scale: 1, duration: 1.3, ease: "expo.out" }, 0.12)
      .fromTo(
        b.querySelector(".ar-giant"),
        { xPercent: 6 * dir, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out" },
        0.3,
      )
      .fromTo(
        all(b, ".ar-tick, .ar-label"),
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power1.out", stagger: 0.03 },
        0.6,
      );

    // the settle, per artifact: a survey plate tips flat, pages drop onto the stack, a glow
    // swells, and the private one simply appears
    const settle: Record<string, gsap.TweenVars> = {
      chart: { rotationX: 9, y: 18 },
      sheets: { rotation: -2.4, y: 22 },
      glow: { scale: 1.05 },
      redact: {},
    };
    tl.fromTo(bMount, { transformPerspective: 1400, ...settle[t] }, { rotationX: 0, rotation: 0, y: 0, scale: 1, duration: 1.4, ease: "expo.out" }, 0.12);
    // the light comes up slowly behind the picture, after it has started to arrive
    tl.fromTo(all(b, ".ar-aura"), { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0.28);
    if (t === "chart") tl.call(() => sweep(b), [], 0.5);
    const deco = all(b, ".ar-deco");
    if (t === "sheets") tl.fromTo(all(b, ".ar-deco-sheets > span"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.25);
    else if (deco.length) tl.fromTo(deco, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power1.out" }, 0.35);
    const marks = all(b, ".ar-marks li");
    if (marks.length) {
      tl.fromTo(marks, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.08 }, 0.5)
        .fromTo(all(b, ".ar-marks i"), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "expo.inOut", stagger: 0.1 }, 0.65);
    }

    tl.call(() => {
      reveal.current = dir;
      setIndex(to);
    }, [], 0.26);
  }, [n, mark, sweep]);
  useLayoutEffect(() => {
    goRef.current = go;
  }, [go]);

  // a switch has swapped the panel's content: bring it in
  useLayoutEffect(() => {
    const dir = reveal.current;
    if (dir === null) return;
    reveal.current = null;
    const tl = gsap.timeline();
    tl.fromTo(q(".ar-word"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out" }, 0).fromTo(
      q("[data-ar-in]"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.04 },
      0.05,
    );
    return () => {
      tl.progress(1);
    };
  }, [index]);

  /**
   * Choose a project. On the sticky stage that means scrolling to its stretch, so the page
   * and the archive never disagree; anywhere else it is just a switch.
   */
  const select = useCallback((i: number, from: "archive" | "away" = "archive") => {
    const to = Math.max(0, Math.min(n - 1, i));
    const el = root.current;
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);
    if (!pinned.current || !el) {
      go(to);
      // asked for from elsewhere on the page: bring the archive up to the selector
      if (from === "away" && el) {
        if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: ease });
        else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (el.offsetHeight - window.innerHeight) * ((to + 0.5) / n);
    jumping.current = to;
    go(to);
    const done = () => {
      jumping.current = null;
    };
    if (lenis) lenis.scrollTo(y, { duration: from === "away" ? 1.8 : 1.1, easing: ease, onComplete: done });
    else {
      window.scrollTo({ top: y, behavior: "smooth" });
      window.setTimeout(done, 900);
    }
  }, [go, lenis, n]);

  // the sticky stage: scroll position → project, plus a restrained pointer response
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    mark(0, true);
    const mm = gsap.matchMedia();
    mm.add(PINNED, () => {
      pinned.current = true;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onToggle: (self) => void (stActive.current = self.isActive),
        onUpdate: (self) => {
          if (jumping.current !== null) return;
          go(Math.min(n - 1, Math.floor(self.progress * n)));
        },
      });
      stRef.current = st;
      // arriving mid-section (a reload, a deep link): show the project for where we are
      go(Math.min(n - 1, Math.floor(st.progress * n)));

      // the mounted artifact leans a degree or so towards the pointer, never more
      const plates = el.querySelector<HTMLElement>(".ar-plates");
      let off = () => {};
      if (plates && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        gsap.set(plates, { transformPerspective: 1600 });
        const rx = gsap.quickTo(plates, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(plates, "rotationY", { duration: 0.8, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          const r = plates.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * 2 - 1;
          const py = ((e.clientY - r.top) / r.height) * 2 - 1;
          rx(Math.max(-1, Math.min(1, py)) * -1.4);
          ry(Math.max(-1, Math.min(1, px)) * 1.8);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };
        const canvas = el.querySelector<HTMLElement>(".ar-canvas");
        canvas?.addEventListener("pointermove", onMove);
        canvas?.addEventListener("pointerleave", onLeave);
        off = () => {
          canvas?.removeEventListener("pointermove", onMove);
          canvas?.removeEventListener("pointerleave", onLeave);
          gsap.set(plates, { clearProps: "transform" });
        };
      }
      return () => {
        off();
        st.kill();
        stRef.current = null;
        stActive.current = false;
        pinned.current = false;
      };
    });

    const first = ScrollTrigger.create({
      trigger: el,
      start: "top 55%",
      once: true,
      onEnter: () => {
        const plate = el.querySelectorAll(".ar-plate")[cur.current];
        if (plate) sweep(plate);
      },
    });

    const remark = () => mark(cur.current, true);
    window.addEventListener("resize", remark);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("resize", remark);
      window.removeEventListener("load", refresh);
      first.kill();
      mm.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // a project card in the spread above asks for a project: show it and go there
  useEffect(() => {
    const onAsk = (e: Event) => {
      const i = visibleProjects.findIndex((x) => x.slug === (e as CustomEvent<string>).detail);
      if (i < 0) return;
      select(i, "away");
      // keyboard users land on the story they asked for
      const panel = root.current?.querySelector<HTMLElement>(".ar-panel");
      panel?.setAttribute("tabindex", "-1");
      window.setTimeout(() => panel?.focus({ preventScroll: true }), 1900);
    };
    window.addEventListener("archive:select", onAsk);
    return () => window.removeEventListener("archive:select", onAsk);
  }, [select]);

  // arrow keys, only while the archive is the thing on screen (or holds focus)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const inside = root.current?.contains(document.activeElement);
      if (!stActive.current && !inside) return;
      e.preventDefault();
      select(cur.current + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [select]);

  return (
    <section
      ref={root}
      id="work"
      className="ar"
      aria-label="Work — project archive"
      style={{ "--ar-n": n } as CSSProperties}
    >
      <div className="ar-sticky">
        <header className="ar-head mono">
          <span className="text-accent">Work</span>
          <span className="ar-motto disp-500">Ideas into things.</span>
          <span className="text-dim">
            Plate <span className="text-bone">{pad(index + 1)}</span> / {pad(n)}
          </span>
        </header>

        <nav className="ar-index" aria-label="Projects">
          <span className="ar-index-label mono">Index</span>
          <ol>
            {visibleProjects.map((x, i) => (
              <li key={x.slug}>
                <button
                  type="button"
                  className="ar-idx"
                  aria-current={i === index ? "true" : undefined}
                  aria-controls="ar-panel"
                  onClick={() => select(i)}
                >
                  <span className="ar-idx-num mono">{pad(i + 1)}</span>
                  <span className="ar-idx-name disp-500">{x.title}</span>
                  <span className="ar-idx-cat mono">{x.category}</span>
                  {x.cover ? (
                    <span className="ar-idx-thumb" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={x.cover} alt="" loading="lazy" decoding="async" />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ol>
          <span className="ar-marker" aria-hidden="true" />

          <div className="ar-count" aria-hidden="true">
            <span className="disp">{pad(index + 1)}</span>
            <span className="mono text-dim">/ {pad(n)}</span>
          </div>
          <div className="ar-steps mono">
            <button type="button" onClick={() => select(cur.current - 1)} disabled={index === 0} aria-label="Previous project">
              <span aria-hidden="true">←</span> Prev
            </button>
            <button type="button" onClick={() => select(cur.current + 1)} disabled={index === n - 1} aria-label="Next project">
              Next <span aria-hidden="true">→</span>
            </button>
          </div>
        </nav>

        <div className="ar-canvas">
          <div className="ar-plates">
            {visibleProjects.map((x, i) => (
              <Plate key={x.slug} p={x} i={i} n={n} on={i === index} />
            ))}
          </div>

          <article id="ar-panel" className="ar-panel" aria-labelledby="ar-title">
            <div className="ar-panel-meta mono" data-ar-in>
              <span>
                <span className="ar-blue">{pad(index + 1)}</span>
                <span className="text-ink/45"> — {p.category}</span>
              </span>
              <span className="ar-status">
                <span className="text-ink/45">{p.year}</span>
                <span className={`ar-dot ar-dot-${p.status}`} aria-hidden="true" />
                {statusLabel[p.status]}
              </span>
            </div>

            <h3 id="ar-title" className="ar-title disp">
              <span className="ar-mask">
                <span className="ar-word">{p.title}</span>
              </span>
            </h3>

            <p className="ar-summary" data-ar-in>
              {p.summary}
            </p>

            <p className="ar-role mono" data-ar-in>
              <span className="text-ink/45">Role — </span>
              {p.role}
            </p>

            <ul className="ar-stack mono" data-ar-in aria-label="Built with">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <div className="ar-actions" data-ar-in>
              {p.links.live ? (
                <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="ar-btn ar-btn-solid mono">
                  Live demo <span aria-hidden="true">↗</span>
                  <span className="sr-only"> for {p.title} (opens in a new tab)</span>
                </a>
              ) : (
                <span className="ar-btn ar-btn-off mono" aria-disabled="true">
                  Live demo — not deployed
                </span>
              )}
              {p.links.github ? (
                <a href={p.links.github} target="_blank" rel="noopener noreferrer" className="ar-btn ar-btn-line mono">
                  GitHub <span aria-hidden="true">↗</span>
                  <span className="sr-only"> for {p.title} (opens in a new tab)</span>
                </a>
              ) : null}
            </div>
          </article>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Project {index + 1} of {n}: {p.title}
      </p>
    </section>
  );
}
