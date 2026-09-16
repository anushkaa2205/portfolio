"use client";

import { useRouter } from "next/navigation";
import gsap from "gsap";
import type { ReactNode, MouseEvent } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

export const VEIL_ID = "page-veil";

/**
 * A link that grows a black disc from the click origin (or the eclipse) until it covers the
 * viewport, then navigates. The destination page removes the veil once it has drawn.
 */
export default function CaseLink({
  href,
  children,
  className,
  origin = "eclipse",
  style,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  origin?: "eclipse" | "pointer";
  style?: React.CSSProperties;
}) {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (prefersReducedMotion()) {
      router.push(href);
      return;
    }
    router.prefetch(href);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = origin === "pointer" ? e.clientX : vw / 2;
    const cy = origin === "pointer" ? e.clientY : vh * 0.45;
    const size = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) * 2 + 40;

    let veil = document.getElementById(VEIL_ID);
    if (!veil) {
      veil = document.createElement("div");
      veil.id = VEIL_ID;
      document.body.appendChild(veil);
    }
    Object.assign(veil.style, {
      position: "fixed",
      left: `${cx}px`,
      top: `${cy}px`,
      width: `${size}px`,
      height: `${size}px`,
      marginLeft: `${-size / 2}px`,
      marginTop: `${-size / 2}px`,
      borderRadius: "50%",
      background: "#070707",
      boxShadow: "0 0 0 1.5px #cfe3ff, 0 0 60px 10px rgba(207,227,255,0.18)",
      zIndex: "40",
      pointerEvents: "none",
      transform: "scale(0)",
      willChange: "transform",
    } as CSSStyleDeclaration);

    gsap.to(veil, {
      scale: 1,
      duration: 0.95,
      ease: "expo.inOut",
      onComplete: () => router.push(href),
    });
  };

  return (
    <a href={href} onClick={onClick} className={className} style={style}>
      {children}
    </a>
  );
}
