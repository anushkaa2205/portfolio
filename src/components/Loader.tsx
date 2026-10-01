"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLenis } from "@/components/SmoothScroll";
import { loader, prefersReducedMotion } from "@/lib/scroll";

/** How long the loader stays up, counted from when the clip starts playing, in seconds. */
const LOAD_SECONDS = 3;
/** If the clip has not started playing by now, start the clock anyway. */
const START_FALLBACK_MS = 1500;

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
        out.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.95, ease: "expo.inOut" }, 0).add(reveal, 0.4);
      }
    };

    // the full LOAD_SECONDS are counted from the moment the clip is actually on screen
    const startClock = () => {
      if (clock !== undefined) return;
      clock = window.setTimeout(() => exit(false), LOAD_SECONDS * 1000);
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
    vid.addEventListener("playing", startClock, { once: true });
    vid.addEventListener("error", onError);
    const sources = vid.querySelectorAll("source");
    const lastSource = sources[sources.length - 1];
    lastSource?.addEventListener("error", onError);

    if (!vid.paused && vid.currentTime > 0) startClock(); // already rolling (second Strict Mode pass)
    timers.push(window.setTimeout(startClock, START_FALLBACK_MS));
    // the sources may have failed before hydration attached the listeners
    timers.push(
      window.setTimeout(() => {
        if (vid.error || vid.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) onError();
      }, 500),
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      vid.removeEventListener("playing", startClock);
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
