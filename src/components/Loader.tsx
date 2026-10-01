"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLenis } from "@/components/SmoothScroll";
import { loader, prefersReducedMotion } from "@/lib/scroll";

/** The loader is fully gone this many seconds after the page first paints (wait + curtain lift). */
const LOAD_SECONDS = 2;
/** Length of the curtain lift, in seconds; the wait before it is LOAD_SECONDS minus this. */
const LIFT_SECONDS = 0.6;
/** Never lift sooner than this after the effect runs, so slow hydration still shows the word. */
const MIN_SHOW_MS = 350;

/**
 * Intro loader: plays a clip full-screen for LOAD_SECONDS, then lifts to reveal the hero.
 * The clip lives at /public/loader/loading.mp4 (+ loading.webm). If it is missing or fails
 * to load, the loader skips itself so the site never sits on a blank screen.
 *
 * Effects here must be safe to run twice (React Strict Mode mounts, unmounts and re-mounts in
 * dev), so cleanup only cancels timers and listeners. It never marks the loader as done.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    if (!loader.done) lenis?.stop();
  }, [lenis]);

  useEffect(() => {
    const el = root.current;
    const vid = video.current;
    if (!el || !vid) return;
    if (loader.done) {
      el.style.display = "none";
      return;
    }

    const reduce = prefersReducedMotion();
    let exiting = false;
    let clock: number | undefined;
    const timers: number[] = [];

    const reveal = () => {
      loader.done = true;
      lenisRef.current?.start();
      window.dispatchEvent(new Event("loader:done"));
    };

    const exit = (instant = false) => {
      if (exiting) return;
      exiting = true;
      const out = gsap.timeline({ onComplete: () => { el.style.display = "none"; } });
      if (instant) {
        out.add(reveal, 0).set(el, { autoAlpha: 0 }, 0);
      } else if (reduce) {
        out.to(el, { opacity: 0, duration: 0.4, ease: "none" }, 0).add(reveal, 0.1);
      } else {
        out.to(el, { clipPath: "inset(0 0 100% 0)", duration: LIFT_SECONDS, ease: "expo.inOut" }, 0).add(reveal, 0.25);
      }
    };

    // the whole intro (wait + lift) is LOAD_SECONDS from first paint, so count from page start, not from playback
    const startClock = () => {
      if (clock !== undefined) return;
      const wait = Math.max(MIN_SHOW_MS, (LOAD_SECONDS - LIFT_SECONDS) * 1000 - performance.now());
      clock = window.setTimeout(() => exit(false), wait);
      timers.push(clock);
    };

    // no clip, no loader
    const onError = () => exit(true);

    try {
      vid.currentTime = 0;
    } catch {
      /* not seekable yet; it starts at 0 anyway */
    }
    vid.play().catch(() => {});
    vid.addEventListener("error", onError);
    const sources = vid.querySelectorAll("source");
    const lastSource = sources[sources.length - 1];
    lastSource?.addEventListener("error", onError);

    startClock();
    // the sources may have failed before hydration attached the listeners
    timers.push(
      window.setTimeout(() => {
        if (vid.error || vid.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) onError();
      }, 500),
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      vid.removeEventListener("error", onError);
      lastSource?.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div ref={root} className="loader" role="status" aria-label="Loading">
      <video ref={video} className="loader-video" muted playsInline preload="auto" aria-hidden="true">
        <source src="/loader/loading.webm" type="video/webm" />
        <source src="/loader/loading.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
