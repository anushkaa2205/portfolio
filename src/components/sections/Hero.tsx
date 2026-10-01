"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { site } from "@/data/site";
import { prefersReducedMotion, whenLoaded } from "@/lib/scroll";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);

  // The name is filled with footage. Play only while the hero is on screen,
  // and never autoplay under reduced motion (the poster frame stays).
  useEffect(() => {
    const el = video.current;
    const section = root.current;
    if (!el || !section || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let tl: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      tl = gsap.timeline({ defaults: { ease: "expo.out" }, paused: true });
      tl.from(".hero-letter", { yPercent: 110, duration: 1.4, stagger: 0.06 }, 0.2)
        .from(".hero-letter-k", { yPercent: 110, duration: 1.4, stagger: 0.06 }, 0.2)
        .from(".hero-fade", { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.9)
        .from(".hero-last > *", { yPercent: 110, duration: 1.2 }, 1.0);
    }, root);
    // the entrance waits for the intro loader to lift; the "from" states are applied straight away
    const stop = whenLoaded(() => tl?.play());
    return () => {
      stop();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-svh flex-col overflow-hidden px-5 pb-8 pt-28 sm:px-10"
      data-eclipse='{"x":0.5,"y":0.54,"r":0.26,"phase":0.6,"o":1}'
    >
      {/* the name — sits *behind* the eclipse (z-10 < canvas z-20) */}
      <div className="pointer-events-none absolute inset-x-0 top-[18vh] z-10 flex justify-center sm:top-[16vh]">
        <div className="hero-name">
          {/* footage layer: bone until the clip is playing, so the name never goes dark */}
          <div className={live ? "hero-name-bg is-live" : "hero-name-bg"} aria-hidden="true">
            <video
              ref={video}
              muted
              loop
              playsInline
              preload="auto"
              poster="/hero/name-fill-poster.webp"
              onPlaying={() => setLive(true)}
            >
              <source src="/hero/name-fill.webm" type="video/webm" />
              <source src="/hero/name-fill.mp4" type="video/mp4" />
            </video>
          </div>
          {/* black plate + white letters, multiplied: the footage shows only through the glyphs */}
          <h1
            className="disp hero-name-text flex"
            style={{ fontSize: "clamp(96px, 27vw, 400px)" }}
            aria-label={`${site.firstName} ${site.lastName}`}
          >
            {site.firstName.split("").map((ch, i) => (
              <span key={i} className="mask">
                <span className="hero-letter">{ch}</span>
              </span>
            ))}
          </h1>
          {/* twin of the name that restores the page colour around the letters (lighten + black glyphs) */}
          <div
            className="disp hero-name-knock flex"
            style={{ fontSize: "clamp(96px, 27vw, 400px)" }}
            aria-hidden="true"
          >
            {site.firstName.split("").map((ch, i) => (
              <span key={i} className="mask">
                <span className="hero-letter-k">{ch}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto grid grid-cols-1 items-end gap-8 sm:grid-cols-[1fr_auto] sm:gap-10">
        <div className="max-w-[420px] sm:mb-14">
          <p className="mono hero-fade text-accent">{site.role}</p>
          <p className="hero-fade mt-3 text-[17px] leading-[1.5] text-bone-2 sm:text-lg">{site.tagline}</p>
        </div>

        <div className="mask hero-last sm:order-none">
          <span
            className="disp outline-text text-right"
            style={{ fontSize: "clamp(64px, 9vw, 128px)", lineHeight: 0.85 }}
          >
            {site.lastName}
          </span>
        </div>

      </div>
    </section>
  );
}
