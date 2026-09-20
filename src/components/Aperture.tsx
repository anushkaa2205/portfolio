"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * The aperture.
 *
 * A circular hole opens from the centre of the viewport until it swallows the screen,
 * revealing the tech stack beneath. The rows are already inside the hole before it
 * opens — that is the whole trick; they are not faded in over a finished panel.
 *
 * Scroll-linked via clip-path on --ap-r (compositor-friendly), sticky rather than
 * ScrollTrigger pin, because pin fights Lenis.
 */
export default function Aperture() {
  const root = useRef<HTMLElement>(null);
  // Touch only: which row is open. Hover devices are handled entirely in CSS.
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const sticky = root.current?.querySelector<HTMLElement>(".ap-sticky");
      if (!sticky) return;

      // The nav scrim is tuned for the dark page; over the bone panel it has to invert
      // or the wordmark goes dark-on-dark. Class toggle only, no animation.
      //
      // The window is deliberately NOT the timeline's range: the timeline ends at
      // "bottom bottom" (where the panel unsticks) but the panel stays on screen,
      // under the nav, for a further viewport-height as it scrolls away.
      ScrollTrigger.create({
        trigger: root.current,
        // With motion, the nav only needs to invert once the hole is wide enough to
        // matter. With reduced motion there is no hole — the panel is there at once.
        start: reduce ? "top top" : "top top-=400",
        end: "bottom top+=100",
        onToggle: (self) => {
          document.documentElement.classList.toggle("nav-light", self.isActive);
        },
      });

      if (reduce) {
        sticky.style.setProperty("--ap-r", "160");
        gsap.set(".ap-stat", { opacity: 1, y: 0 });
        return;
      }

      gsap.set(".ap-stat", { opacity: 0, y: 48 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // the hole opens, the rim goes with it, the numbers arrive once there is room.
      // Nothing fades back out: the panel simply scrolls away with its content intact,
      // otherwise the tail of the section is a screen of empty bone.
      tl.fromTo(sticky, { "--ap-r": 6 }, { "--ap-r": 170, ease: "power2.inOut", duration: 0.5 }, 0)
        .to(".ap-ring", { opacity: 0, duration: 0.26, ease: "power1.in" }, 0.18)
        .to(".ap-stat", { opacity: 1, y: 0, stagger: 0.1, duration: 0.45, ease: "expo.out" }, 0.3);
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
        {/* what the aperture reveals */}
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
