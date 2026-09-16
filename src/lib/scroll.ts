/**
 * A tiny shared store for the scroll state, written by SmoothScroll every frame
 * and read by anything that animates (the eclipse, the ghost trail). No React re-renders.
 */
export const scrollState = {
  y: 0,
  velocity: 0,
  progress: 0,
  limit: 1,
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
