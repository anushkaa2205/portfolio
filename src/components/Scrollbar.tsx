"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "./SmoothScroll";
import { prefersReducedMotion } from "@/lib/scroll";

/** px of pill left clear above and below the thumb's travel */
const PAD = 2;
/** how long the bar stays lit after the last scroll */
const LINGER = 1200;

/**
 * The scrollbar: a thin outlined pill on the right edge with a small ice-blue dot that
 * rides it, and the scroll percentage under it.
 *
 * It is a reading of the real document scroll, never a replacement for it — the wheel,
 * trackpad, touch and keys all scroll the page natively (through Lenis, as before) and the
 * dot just follows window.scrollY against the live scrollable height. Dragging the dot or
 * clicking the pill asks Lenis to scroll there, so everything scroll-linked (the spread,
 * the archive, ScrollTrigger) sees an ordinary scroll.
 *
 * Quiet when idle; it lights up while scrolling, when the pointer comes near the right
 * edge, while dragging or focused, and fades again after a moment. On touch screens it is
 * an indicator only, so it can never get in the way of a swipe.
 */
export default function Scrollbar() {
  const lenis = useLenis();
  const root = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const th = thumb.current;
    const lb = label.current;
    if (!el || !th || !lb) return;

    let max = 1;
    let raf = 0;
    let hide = 0;
    let dragging = false;
    let near = false;
    let grab = 0;

    const measure = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const render = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      const travel = el.clientHeight - th.offsetHeight - PAD * 2;
      th.style.transform = `translate3d(-50%, ${PAD + p * Math.max(0, travel)}px, 0)`;
      const v = Math.round(p * 100);
      lb.textContent = `${v}%`;
      el.setAttribute("aria-valuenow", String(v));
      el.setAttribute("aria-valuetext", `${v}% of the page`);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const sleepLater = () => {
      window.clearTimeout(hide);
      hide = window.setTimeout(() => {
        if (!dragging && !near && document.activeElement !== el) delete el.dataset.awake;
      }, LINGER);
    };
    const wake = () => {
      el.dataset.awake = "true";
      sleepLater();
    };

    /** where on the page a pointer at clientY points, given where on the dot it was grabbed */
    const target = (clientY: number, offset: number) => {
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - th.offsetHeight - PAD * 2);
      const p = (clientY - r.top - PAD - offset) / travel;
      return Math.min(1, Math.max(0, p)) * max;
    };
    const jump = (y: number, smooth: boolean) => {
      const reduce = prefersReducedMotion();
      if (lenis) lenis.scrollTo(y, smooth && !reduce ? { duration: 0.9, easing: (t: number) => 1 - Math.pow(1 - t, 3) } : { immediate: true });
      else window.scrollTo({ top: y, behavior: smooth && !reduce ? "smooth" : "auto" });
    };

    // — dragging the dot —
    const onThumbDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      grab = e.clientY - th.getBoundingClientRect().top;
      th.setPointerCapture(e.pointerId);
      el.dataset.dragging = "true";
      document.documentElement.classList.add("sb-dragging");
      wake();
    };
    const onThumbMove = (e: PointerEvent) => {
      if (!dragging) return;
      jump(target(e.clientY, grab), false);
    };
    const onThumbUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (th.hasPointerCapture(e.pointerId)) th.releasePointerCapture(e.pointerId);
      delete el.dataset.dragging;
      document.documentElement.classList.remove("sb-dragging");
      sleepLater();
    };

    // — clicking the pill: go to that point —
    const onTrackDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.target === th || th.contains(e.target as Node)) return;
      e.preventDefault();
      jump(target(e.clientY, th.offsetHeight / 2), true);
      wake();
    };

    // — the keyboard, when the bar itself has focus —
    const onKey = (e: KeyboardEvent) => {
      const vh = window.innerHeight;
      const steps: Record<string, number> = {
        ArrowDown: 80,
        ArrowUp: -80,
        PageDown: vh * 0.9,
        PageUp: -vh * 0.9,
        " ": e.shiftKey ? -vh * 0.9 : vh * 0.9,
      };
      let y: number | null = null;
      if (e.key in steps) y = window.scrollY + steps[e.key];
      else if (e.key === "Home") y = 0;
      else if (e.key === "End") y = max;
      if (y === null) return;
      e.preventDefault();
      jump(Math.min(max, Math.max(0, y)), true);
      wake();
    };

    // — lighting up when the pointer comes near the edge —
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const isNear = e.clientX > window.innerWidth - 56;
      if (isNear === near) return;
      near = isNear;
      if (near) {
        el.dataset.awake = "true";
        window.clearTimeout(hide);
      } else sleepLater();
    };

    const onScroll = () => {
      schedule();
      wake();
    };
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (fine.matches) window.addEventListener("pointermove", onMove, { passive: true });
    // the page grows and shrinks under us (fonts, images, sections laying out): follow it
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    th.addEventListener("pointerdown", onThumbDown);
    th.addEventListener("pointermove", onThumbMove);
    th.addEventListener("pointerup", onThumbUp);
    th.addEventListener("pointercancel", onThumbUp);
    el.addEventListener("pointerdown", onTrackDown);
    el.addEventListener("keydown", onKey);
    el.addEventListener("focus", wake);
    el.addEventListener("blur", sleepLater);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hide);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      th.removeEventListener("pointerdown", onThumbDown);
      th.removeEventListener("pointermove", onThumbMove);
      th.removeEventListener("pointerup", onThumbUp);
      th.removeEventListener("pointercancel", onThumbUp);
      el.removeEventListener("pointerdown", onTrackDown);
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("focus", wake);
      el.removeEventListener("blur", sleepLater);
      document.documentElement.classList.remove("sb-dragging");
    };
  }, [lenis]);

  return (
    <div
      ref={root}
      className="sb"
      role="scrollbar"
      aria-label="Page scroll"
      aria-controls="main"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      tabIndex={0}
    >
      <span className="sb-pill" aria-hidden="true" />
      <div ref={thumb} className="sb-thumb" aria-hidden="true">
        <span className="sb-dot" />
      </div>
      <span ref={label} className="sb-label mono" aria-hidden="true">
        0%
      </span>
    </div>
  );
}
