"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * The aperture, in two acts.
 *
 * Act one — the spread. A fanned pile of cards sits on the middle of the screen, covering
 * a statement: BUILDING SYSTEMS THAT WORK. Scrolling untwists the pile and throws it
 * outward to scattered rest positions, and the statement is simply uncovered. Once the
 * cards are out, they drift with the pointer.
 *
 * Act two — the hole. Only after the spread has held does the pill open, swallow the
 * screen and hand over to the tech stack. The rows are already inside the hole before it
 * opens; they are not faded in over a finished panel.
 *
 * Scroll-linked via clip-path on --ap-r (compositor-friendly), sticky rather than
 * ScrollTrigger pin, because pin fights Lenis. Card motion is transform-only.
 */

type Placement = {
  /** where the card sits in the pile: vw / vh / deg */
  stack: { x: number; y: number; r: number };
  /** where it lands once thrown out */
  rest: { x: number; y: number; r: number; s: number };
  /** box size — a vw number and a vh number; see --sp-w / --sp-h in globals.css */
  w: number;
  h: number;
  /** paint order */
  z: number;
  /** dropped on phones, where eight cards is soup */
  optional?: boolean;
};

type Card = Placement &
  (
    | {
        kind: "shot";
        src: string;
        alt: string;
        href?: string;
        tag: string;
        note: string;
        /**
         * The covers are ~1.93:1 and the boxes are ~1.5:1, so `cover` crops about a fifth
         * of the width. On a shot whose title sits hard against the left edge, centring
         * that crop eats the first word — those get "left" instead.
         */
        pos?: "left" | "center";
      }
    | { kind: "spec"; title: string; meta: string; tag: string; note: string }
  );

/**
 * Eight cards ringing the statement: six screenshots and two plain-text cards, for the
 * parts of the work that have nothing worth screenshotting.
 *
 * The pile is fanned hard (±18°) and lands almost square (±2°), so the throw reads as the
 * cards untwisting, not just sliding. Each one keeps its own rest scale — a ring of
 * identically sized cards looks like a grid, which is the opposite of the point.
 *
 * To add another: drop the image in /public/work, copy an entry, and give it a `rest`
 * slot nobody else has. Past about ten the ring stops reading as a ring.
 */
const CARDS: Card[] = [
  // top-left
  {
    kind: "shot",
    src: "/work/udgam.webp",
    alt: "Udgam — satellite drift modelling",
    href: "/work/udgam",
    tag: "01 — Udgam",
    pos: "left",
    note: "SIH",
    stack: { x: -11.88, y: -10, r: -18 },
    rest: { x: -24, y: -32, r: -1.5, s: 0.9 },
    w: 17,
    h: 18,
    z: 2,
  },
  // top-centre
  {
    kind: "shot",
    src: "/work/noise.webp",
    alt: "Noise — an unfiltered posting board",
    tag: "05 — Noise",
    note: "Posts",
    stack: { x: -2.88, y: -10, r: -2 },
    rest: { x: 4, y: -33, r: 1.2, s: 0.82 },
    w: 22,
    h: 23,
    z: 3,
    optional: true,
  },
  // top-right
  {
    kind: "shot",
    src: "/work/specforge.webp",
    alt: "SpecForge — AI-generated product specs",
    href: "/work/specforge",
    tag: "02 — SpecForge",
    note: "Live",
    stack: { x: 10.12, y: -10, r: 20 },
    rest: { x: 32, y: -29, r: 1.8, s: 0.85 },
    w: 19,
    h: 20,
    z: 4,
  },
  // mid-left
  {
    kind: "spec",
    title: "Ship it somewhere real",
    meta: "AWS · EC2 · ALB · S3 · IAM · DOCKER",
    tag: "Infra",
    note: "Deploys",
    stack: { x: -19.88, y: 0, r: -4 },
    rest: { x: -35, y: -1, r: -2, s: 0.86 },
    w: 16,
    h: 26,
    z: 5,
    optional: true,
  },
  // mid-right
  {
    kind: "shot",
    src: "/work/mytasks.webp",
    alt: "my-tasks — a serverless task list on AWS",
    tag: "06 — my-tasks",
    note: "Serverless",
    stack: { x: 14.12, y: 1, r: 6 },
    rest: { x: 36, y: 5, r: 2, s: 0.84 },
    w: 18,
    h: 19,
    z: 6,
    optional: true,
  },
  // bottom-left
  {
    kind: "shot",
    src: "/work/medora.webp",
    alt: "Medora",
    href: "/work/medora",
    tag: "03 — Medora",
    pos: "left",
    note: "Case study",
    stack: { x: -9.88, y: 10, r: 6 },
    rest: { x: -25, y: 33, r: -1.8, s: 0.88 },
    w: 21,
    h: 22,
    z: 7,
  },
  // bottom-centre
  {
    kind: "spec",
    title: "Motion that behaves",
    meta: "GSAP · SCROLLTRIGGER · LENIS · R3F",
    tag: "Front of house",
    note: "Motion",
    stack: { x: 4.12, y: 7, r: 3 },
    rest: { x: 2, y: 35, r: 1, s: 0.8 },
    w: 19,
    h: 24,
    z: 8,
    optional: true,
  },
  // bottom-right
  {
    kind: "shot",
    src: "/work/obscura.webp",
    alt: "Obscura",
    href: "/work/obscura",
    tag: "04 — Obscura",
    note: "Case study",
    stack: { x: 16.12, y: 12, r: -7 },
    rest: { x: 30, y: 33, r: -1.2, s: 0.9 },
    w: 17,
    h: 18,
    z: 9,
  },
];

/** How small the whole pile is before it opens. Near full size, like a real stack of prints. */
const STACK_SCALE = 0.82;

/** The pointer drift once the cards are out, in vw / vh at full deflection. */
const DRIFT_X = 2.6;
const DRIFT_Y = 2.2;
/** Back cards drift least, front cards most, so the ring has depth. */
const driftDepth = (i: number, n: number) => (n <= 1 ? 1 : 0.55 + (i / (n - 1)) * 0.75);

/** The statement the pile is hiding. One mask per word, so it can rise in pieces. */
const STATEMENT = ["Building", "systems", "that"] as const;

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Aperture() {
  const root = useRef<HTMLElement>(null);
  // Touch only: which row is open. Hover devices are handled entirely in CSS.
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const sticky = root.current?.querySelector<HTMLElement>(".ap-sticky");
      if (!sticky) return;

      if (reduce) {
        sticky.style.setProperty("--ap-r", "160");
        gsap.set(".ap-disc", { opacity: 1 });
        gsap.set(".ap-stat", { opacity: 1, y: 0 });
        gsap.set(".sp-word", { yPercent: 0 });
        document.documentElement.classList.add("nav-light");
        return;
      }

      // Phones keep only the five corner cards (see `optional`), so the scatter can stay
      // wide without anything landing in the middle band where the statement is.
      const narrow = () => window.innerWidth < 768;
      const vw = () => window.innerWidth / 100;
      const vh = () => window.innerHeight / 100;
      const spreadX = () => vw() * (narrow() ? 0.7 : 1);
      const spreadY = () => vh() * (narrow() ? 0.68 : 1);

      const outers = gsap.utils.toArray<HTMLElement>(".sp-card");
      const inners = gsap.utils.toArray<HTMLElement>(".sp-card-in");

      gsap.set(".ap-stat", { opacity: 0, y: 48 });
      gsap.set(".sp-word", { yPercent: 115 });
      // The pill is dark until it opens. A bone disc sitting under the statement for the
      // whole of act one would punch a hole through the middle of the words.
      gsap.set(".ap-disc", { opacity: 0 });
      gsap.set(".ap-ring", { opacity: 0 });
      gsap.set(".sp-head", { opacity: 0.25, scale: 0.92 });
      gsap.set(outers, { xPercent: -50, yPercent: -50 });
      gsap.set(inners, {
        // the pile: near full size, heavily fanned, overlapping
        x: (i: number) => CARDS[i].stack.x * spreadX(),
        y: (i: number) => CARDS[i].stack.y * spreadY(),
        rotate: (i: number) => CARDS[i].stack.r,
        scale: STACK_SCALE,
      });

      /*
        Every position and duration below is a fraction of ONE unit, because a scrubbed
        timeline maps the scroll range onto tl.duration() — not onto 1. A tween that ends
        at 1.26 quietly rescales everything, and the hole starts opening at 0.52 of the
        scroll instead of 0.70. The last thing to finish is the hole itself, at exactly 1.
      */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          // the vw/vh targets are resolved to pixels at build time, so a resize has
          // to rebuild them or the scatter is sized for the old viewport
          invalidateOnRefresh: true,
        },
      });

      // — act one —
      tl.to(".sp-hint", { autoAlpha: 0, duration: 0.05, ease: "none" }, 0); // ends 0.05

      // The statement is uncovered by the cards backing away; this only takes it from a
      // shadow of itself to full strength while that happens.
      tl.to(".sp-word", { yPercent: 0, stagger: 0.02, duration: 0.06, ease: "expo.out" }, 0)
        .to(".sp-head", { opacity: 1, scale: 1, duration: 0.32, ease: "power2.out" }, 0); // ends 0.32

      // the pile untwists and throws itself apart, from the centre outward so it looks
      // pushed rather than dealt
      tl.to(
        inners,
        {
          x: (i: number) => CARDS[i].rest.x * spreadX(),
          y: (i: number) => CARDS[i].rest.y * spreadY(),
          rotate: (i: number) => CARDS[i].rest.r,
          scale: (i: number) => CARDS[i].rest.s,
          duration: 0.3,
          ease: "power3.out",
          stagger: { each: 0.014, from: "center" },
        },
        0.02, // ends 0.418
      );

      // — the hold — 0.42 to 0.58, where the ring just sits there and drifts

      // — the handover —
      tl.to(
        inners,
        {
          scale: 0.9,
          autoAlpha: 0,
          duration: 0.08,
          ease: "power2.in",
          stagger: { each: 0.005, from: "edges" },
        },
        0.58, // ends 0.695 — autoAlpha, not opacity, so the links stop taking clicks too
      );
      // out before the hole is wide, since the statement is bone-on-bone over the panel
      tl.to(".sp-head", { opacity: 0, y: -60, duration: 0.09, ease: "power2.in" }, 0.6); // ends 0.69

      // the rim fades up in the cleared centre: the only sign that there is a hole there
      // at all, and the cue that it is about to open
      tl.set(sticky, { "--ap-r": 6 }, 0);
      tl.to(".ap-ring", { opacity: 1, duration: 0.06, ease: "power1.out" }, 0.6); // ends 0.66

      // — act two —
      // the hole opens, the rim goes with it, the numbers arrive once there is room.
      // Nothing fades back out: the panel simply scrolls away with its content intact,
      // otherwise the tail of the section is a screen of empty bone.
      tl.to(".ap-disc", { opacity: 1, duration: 0.04, ease: "none" }, 0.68)
        .to(sticky, { "--ap-r": 170, ease: "power2.inOut", duration: 0.3 }, 0.7) // ends 1.000
        .to(".ap-ring", { opacity: 0, duration: 0.16, ease: "power1.in" }, 0.72)
        // four elements at 0.02 apart, so the tail lands at 1.000 — inside the unit
        .to(".ap-stat", { opacity: 1, y: 0, stagger: 0.02, duration: 0.18, ease: "expo.out" }, 0.76);

      // If this ever prints something other than 1, the fractions above have drifted and
      // every cue is firing at the wrong point in the scroll.
      if (process.env.NODE_ENV !== "production" && Math.abs(tl.duration() - 1) > 0.001) {
        console.warn("[aperture] timeline duration is", tl.duration(), "— expected 1");
      }

      /*
        Pointer parallax, on the OUTER box so it never fights the timeline on the inner
        one. Only while the ring is out and still — before that the cards are moving on
        their own, and after it they are on their way out.
      */
      const drift = outers.map((el, i) => ({
        x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" }),
        d: driftDepth(i, outers.length),
      }));
      let driftOn = false;
      const onMove = (e: PointerEvent) => {
        if (!driftOn) return;
        const px = (e.clientX / window.innerWidth) * 2 - 1;
        const py = (e.clientY / window.innerHeight) * 2 - 1;
        for (const c of drift) {
          c.x(-px * DRIFT_X * vw() * c.d);
          c.y(-py * DRIFT_Y * vh() * c.d);
        }
      };
      const settle = () => {
        for (const c of drift) {
          c.x(0);
          c.y(0);
        }
      };
      const canDrift = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (canDrift) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", settle);
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const on = self.progress > 0.36 && self.progress < 0.6;
            if (on === driftOn) return;
            driftOn = on;
            if (!on) settle();
          },
        });
      }

      // The nav scrim is tuned for the dark page; over the bone panel it has to invert
      // or the wordmark goes dark-on-dark. Class toggle only, no animation.
      //
      // Not where the hole starts opening — where it is finally wide enough to reach the
      // top of the screen. Invert any earlier and the nav goes bone over a black page.
      // Expressed as a fraction of the scrub distance, so changing the stage height
      // cannot silently desync it. It ends late, because the panel stays on screen under
      // the nav for a further viewport-height after the timeline is done.
      const openAt = 0.8;
      ScrollTrigger.create({
        trigger: root.current,
        start: () => {
          const scrub = (root.current?.offsetHeight ?? 0) - window.innerHeight;
          return `top top-=${Math.round(scrub * openAt)}`;
        },
        end: "bottom top+=100",
        invalidateOnRefresh: true,
        onToggle: (self) => {
          document.documentElement.classList.toggle("nav-light", self.isActive);
        },
      });

      return () => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", settle);
      };
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      document.documentElement.classList.remove("nav-light");
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="index" className="ap-stage relative" aria-label="Tech stack">
      <div className="ap-sticky sticky top-0 flex h-svh items-center justify-center overflow-hidden bg-ink">
        {/*
          Act one. Painted above the disc (z-index in globals.css) rather than after it
          in the DOM, so that under reduced motion — where everything unstacks — the
          statement still reads as a heading above the panel instead of below it.
        */}
        <div className="sp-layer">
          <div className="sp-head">
            <h2 className="disp text-bone">
              {STATEMENT.map((w) => (
                <span key={w} className="sp-mask">
                  <span className="sp-word">{w}</span>
                </span>
              ))}
              <span className="sp-mask">
                <span className="sp-word sp-accent">work.</span>
              </span>
            </h2>
          </div>

          {CARDS.map((c, i) => {
            const label = (
              <div className="sp-tag mono">
                <span>{c.tag}</span>
                <span>{c.note}</span>
              </div>
            );

            const body: ReactNode =
              c.kind === "shot" ? (
                <>
                  <Image src={c.src} alt="" fill sizes="(max-width: 767px) 45vw, 22vw" />
                  {c.href ? (
                    <span className="sp-go mono" aria-hidden="true">
                      Case study ↗
                    </span>
                  ) : null}
                  {label}
                </>
              ) : (
                <>
                  <div className="sp-spec">
                    <p className="sp-spec-title disp-500">{c.title}</p>
                    <p className="sp-spec-meta mono">{c.meta}</p>
                  </div>
                  {label}
                </>
              );

            // Only the project cards go anywhere. The rest are scenery, and scenery that
            // looks clickable and is not is worse than scenery.
            const linked = c.kind === "shot" && c.href;

            return (
              <div
                key={c.tag}
                className="sp-card"
                data-optional={c.optional ? "true" : undefined}
                style={
                  {
                    "--sp-w": c.w,
                    "--sp-h": c.h,
                    "--sp-z": c.z,
                    "--sp-pos": c.kind === "shot" ? (c.pos ?? "center") : undefined,
                  } as CSSProperties
                }
              >
                <div className="sp-card-in">
                  {linked ? (
                    <a
                      href={c.href}
                      className="sp-face pointer-events-auto"
                      aria-label={`${c.tag} — case study`}
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="sp-face" aria-hidden="true">
                      {body}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="sp-hint mono" aria-hidden="true">
            <span className="text-bone">Scroll to spread</span>
            <Chevron />
          </div>
        </div>

        {/* Act two — what the aperture reveals */}
        <div className="ap-disc absolute inset-0 bg-bone text-ink">
          <div className="flex h-full flex-col pb-8 pt-24 sm:pb-10 sm:pt-28">
            <span className="ap-stat mono mb-4 block px-5 text-ink/45 sm:mb-6 sm:px-10">01 — Tech stack</span>

            {/*
              Three equal-height rows. Each row reserves room for its own list, so opening one
              moves nothing — the list just fades up into space that was already there.
              Hover/keyboard are pure CSS; `open` exists only so a tap can do the same on touch.
            */}
            <div className="flex min-h-0 flex-1 flex-col border-b border-ink/15">
              {site.techStack.map((g, i) => (
                <div
                  key={g.lead}
                  tabIndex={0}
                  data-dir={i % 2 === 1 ? "right" : "left"}
                  onClick={() => {
                    if (window.matchMedia("(hover: hover)").matches) return;
                    setOpen((o) => (o === i ? null : i));
                  }}
                  className={`ap-stat tk-row border-t border-ink/15 ${open === i ? "is-open" : ""}`}
                  // Duration scales with the item count so every row scrolls at the same
                  // pixel speed — a 4-item row and a 15-item row would otherwise differ wildly.
                  style={{ "--tk-dur": `${g.items.length * 2.6}s` } as CSSProperties}
                >
                  <h3 className="tk-title disp px-5 pt-3 sm:px-10 sm:pt-4">
                    {g.lead} <span className="tk-tail">{g.tail}</span>
                  </h3>

                  <div className="tk-marquee">
                    <div className="tk-track">
                      <ul className="tk-list">
                        {g.items.map((t) => (
                          <li key={t} className="tk-item disp-500">{t}</li>
                        ))}
                      </ul>
                      {/* the seamless second lap; hidden from screen readers so the list reads once */}
                      <ul className="tk-list" aria-hidden="true">
                        {g.items.map((t) => (
                          <li key={`${t}-clone`} className="tk-item disp-500">{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* the rim — a thin ring riding the edge of the hole while it is still small */}
        <div className="ap-ring pointer-events-none absolute rounded-full border border-accent" aria-hidden="true" />
      </div>
    </section>
  );
}
