/**
 * A tiny shared store for the scroll state, written by SmoothScroll every frame
 * and read by anything that animates (e.g. the ghost trail). No React re-renders.
 */
export const scrollState = {
  y: 0,
  velocity: 0,
  progress: 0,
  limit: 1,
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The intro loader flips this once the curtain starts to lift. Hero (and anything else that
 * plays an entrance) waits on it so the entrance happens in front of the visitor, not behind the loader.
 */
export const loader = { done: false };

/** Run `cb` once the loader has lifted (immediately if it already has). Returns a cleanup. */
export const whenLoaded = (cb: () => void): (() => void) => {
  if (typeof window === "undefined" || loader.done) {
    cb();
    return () => {};
  }
  let fired = false;
  const go = () => {
    if (fired) return;
    fired = true;
    window.removeEventListener("loader:done", go);
    window.clearTimeout(failsafe);
    cb();
  };
  // If the loader never reports in (it errored, say), do not leave the hero hidden.
  const failsafe = window.setTimeout(go, 7000);
  window.addEventListener("loader:done", go);
  return () => {
    fired = true;
    window.removeEventListener("loader:done", go);
    window.clearTimeout(failsafe);
  };
};
