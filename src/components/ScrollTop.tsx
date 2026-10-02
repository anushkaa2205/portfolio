"use client";

import { useEffect, useState } from "react";
import { useLenis } from "./SmoothScroll";
import { prefersReducedMotion } from "@/lib/scroll";

/** Appears once the hero is mostly scrolled past, so it is never sitting on the first screen. */
const SHOW_AFTER = 0.6; // × the viewport height

/**
 * A fixed scroll-to-top button, bottom right. Hidden at the top of the page, fades in after
 * the first screen. It goes through Lenis when it is running, so it eases like every other
 * jump on the page; the native smooth scroll is the fallback (and "auto" under reduced motion).
 * Over the bone tech-stack panel it inverts with the nav — see `.to-top` in globals.css.
 */
export default function ScrollTop() {
  const lenis = useLenis();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Scroll to top"
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      data-shown={shown ? "true" : "false"}
      className="to-top"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
