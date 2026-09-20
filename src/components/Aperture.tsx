"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * The aperture.
 *
 * A circular hole opens from the centre of the viewport until it swallows the screen,
 * revealing the index strip beneath. The numbers are already inside the hole before it
 * opens — that is the whole trick; they are not faded in over a finished panel.
 *
 * Scroll-linked via clip-path on --ap-r (compositor-friendly), sticky rather than
 * ScrollTrigger pin, because pin fights Lenis.
 */
export default function Aperture() {
  const root = useRef<HTMLElement>(null);

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
    <section ref={root} id="index" className="ap-stage relative" aria-label="Index">
      <div className="ap-sticky sticky top-0 flex h-svh items-center justify-center overflow-hidden bg-ink">
        {/* what the aperture reveals */}
        <div className="ap-disc absolute inset-0 bg-bone text-ink">
          <div className="flex h-full flex-col justify-center px-5 sm:px-10">
            <span className="ap-stat mono mb-10 block text-ink/45 sm:mb-14">01 — Index</span>
            <div className="flex flex-col gap-8 sm:gap-12">
              {site.stats.map((s) => (
                <div
                  key={s.label}
                  className="ap-stat flex flex-col gap-1 border-t border-ink/15 pt-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
                >
                  <span className="disp leading-none" style={{ fontSize: "clamp(56px, 10vw, 140px)" }}>
                    {s.value}
                  </span>
                  <span className="flex flex-col sm:items-end sm:text-right">
                    <span className="disp-500" style={{ fontSize: "clamp(19px, 2.3vw, 30px)" }}>{s.label}</span>
                    <span className="mono mt-1 text-ink/45">{s.meta}</span>
                  </span>
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
