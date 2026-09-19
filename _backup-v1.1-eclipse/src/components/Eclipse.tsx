"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { scrollState, prefersReducedMotion } from "@/lib/scroll";

/**
 * The one motif on the site. A full-screen fragment shader draws a black "moon" disc crossing a
 * thin "sun" ring with a soft corona. Sections declare where the eclipse should be and how far
 * along it is via `data-eclipse='{"x":0.5,"y":0.5,"r":0.3,"phase":0.4,"o":1}'`; this component
 * interpolates between those keyframes on the smoothed scroll value every frame.
 *
 *   x, y   — centre, as a fraction of the viewport
 *   r      — radius, as a fraction of min(vw, vh)
 *   phase  — 0 = moon far right, 1 = totality (concentric), >1 = moon leaving left
 *   o      — opacity
 *   m      — optional overrides for narrow viewports (< 768px), e.g. "m":{"y":0.16,"r":0.05}
 */
type Key = { x: number; y: number; r: number; phase: number; o: number; top: number };

const ACCENT = "#cfe3ff";
const BONE = "#ede8e0";

const vertex = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform vec2 uCenter;   // px, y up
  uniform float uRadius;  // px
  uniform float uPhase;
  uniform float uOpacity;
  uniform float uIntro;   // 0..1 load-in
  uniform float uTime;
  uniform vec3 uAccent;
  uniform vec3 uBone;

  void main() {
    vec2 p = gl_FragCoord.xy;
    float R = uRadius * (0.92 + 0.08 * uIntro);
    if (R < 0.5) { gl_FragColor = vec4(0.0); return; }

    float d = length(p - uCenter);

    // sun: thin ring
    float ring = 1.0 - smoothstep(0.0, 1.6, abs(d - R) - 0.6);

    // corona: soft falloff outside the sun, breathing very slightly
    float breathe = 1.0 + 0.04 * sin(uTime * 0.6);
    float outside = max(d - R, 0.0);
    float glow = exp(-outside / (R * 0.11 * breathe)) * step(R - 0.5, d);

    // moon: black disc sliding across
    float off = (1.0 - uPhase) * R * 1.3;
    vec2 mc = uCenter + vec2(off, off * 0.22);
    float md = length(p - mc);
    float rm = R * 1.004;
    float moon = 1.0 - smoothstep(rm - 1.0, rm + 1.0, md);

    // how close to totality
    float tot = 1.0 - min(abs(1.0 - uPhase) * 2.2, 1.0);

    // premultiplied "over" compositing, back to front: corona, ring, moon
    // tiny dither so the corona never bands on 8-bit displays
    float dither = (fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 128.0;
    float g = max(glow * (0.28 + 0.72 * tot) + dither * glow, 0.0) * (1.0 - moon) * uIntro;
    // faint body of the sun so the crescent reads as a disc, not a ring
    float body = (1.0 - smoothstep(R - 1.5, R + 0.5, d)) * 0.07 * (1.0 - moon) * uIntro;
    vec3 col = uAccent * g + uBone * body;
    float a = g + body;

    vec3 ringCol = mix(uBone, uAccent, tot);
    float rg = ring * (1.0 - moon) * uIntro;
    col = col * (1.0 - rg) + ringCol * rg;
    a = a * (1.0 - rg) + rg;

    col = col * (1.0 - moon) + vec3(0.0275) * moon;
    a = a * (1.0 - moon) + moon;

    gl_FragColor = vec4(col * uOpacity, a * uOpacity);
  }
`;

function Scene() {
  const { size, viewport } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const keys = useRef<Key[]>([]);
  const intro = useRef({ v: 0 });

  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(0, 0) },
      uRadius: { value: 0 },
      uPhase: { value: 0.4 },
      uOpacity: { value: 1 },
      uIntro: { value: 0 },
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(ACCENT) },
      uBone: { value: new THREE.Color(BONE) },
    }),
    [],
  );

  // Read keyframes from the DOM; refresh on resize and when the page changes.
  useEffect(() => {
    const read = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-eclipse]"));
      const scrollY = window.scrollY;
      keys.current = els
        .map((el) => {
          try {
            const raw = JSON.parse(el.dataset.eclipse || "{}");
            const { m, ...k } = raw;
            const narrow = window.innerWidth < 768;
            const top = el.getBoundingClientRect().top + scrollY;
            return { x: 0.5, y: 0.5, r: 0.3, phase: 0.4, o: 1, ...k, ...(narrow && m ? m : {}), top } as Key;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as Key[];
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(document.body);
    window.addEventListener("resize", read);
    const mo = new MutationObserver(read);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", read);
    };
  }, []);

  // Load-in: the disc breathes in from 92 %.
  useEffect(() => {
    const tween = gsap.to(intro.current, {
      v: 1,
      duration: prefersReducedMotion() ? 0 : 1.6,
      ease: "expo.out",
      delay: 0.15,
    });
    return () => {
      tween.kill();
    };
  }, []);

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    const W = size.width;
    const H = size.height;
    const dpr = viewport.dpr;
    m.uniforms.uRes.value.set(W * dpr, H * dpr);
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uIntro.value = intro.current.v;

    const ks = keys.current;
    if (!ks.length) {
      m.uniforms.uOpacity.value = 0;
      return;
    }

    const y = prefersReducedMotion() ? window.scrollY : scrollState.y || window.scrollY;
    // find bracketing keyframes
    let a = ks[0];
    let b = ks[0];
    let t = 0;
    for (let i = 0; i < ks.length; i++) {
      if (y >= ks[i].top) {
        a = ks[i];
        b = ks[Math.min(i + 1, ks.length - 1)];
      }
    }
    const span = Math.max(b.top - a.top, 1);
    t = a === b ? 0 : Math.min(Math.max((y - a.top) / span, 0), 1);
    // smoothstep so the motif eases between sections instead of moving linearly
    t = t * t * (3 - 2 * t);

    const lerp = (p: number, q: number) => p + (q - p) * t;
    const minSide = Math.min(W, H);
    const cx = lerp(a.x, b.x) * W * dpr;
    const cy = (1 - lerp(a.y, b.y)) * H * dpr; // gl y is up
    m.uniforms.uCenter.value.set(cx, cy);
    m.uniforms.uRadius.value = lerp(a.r, b.r) * minSide * dpr;
    m.uniforms.uPhase.value = lerp(a.phase, b.phase);
    m.uniforms.uOpacity.value = lerp(a.o, b.o);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        premultipliedAlpha
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function Eclipse() {
  return (
    <div className="eclipse-layer pointer-events-none fixed inset-0 z-20" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        frameloop="always"
        style={{ background: "transparent", pointerEvents: "none" }}
        eventSource={undefined}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
