"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { VEIL_ID } from "./CaseLink";
import { useLenis } from "./SmoothScroll";

/** Fades away the transition disc left behind by CaseLink once the new page has drawn. */
export default function VeilRemover() {
  const lenis = useLenis();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
      const el = document.querySelector(hash) as HTMLElement;
      setTimeout(() => (lenis ? lenis.scrollTo(el, { immediate: true }) : el.scrollIntoView()), 50);
    } else {
      window.scrollTo(0, 0);
      lenis?.scrollTo(0, { immediate: true });
    }
    const veil = document.getElementById(VEIL_ID);
    if (!veil) return;
    gsap.to(veil, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      delay: 0.1,
      onComplete: () => veil.remove(),
    });
  }, [lenis]);
  return null;
}
