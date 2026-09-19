# MASTER PLAN — anushka.dev

The single source of truth for what this site is, why it looks the way it does, how it is built, and what is still open.
Read this first in any future session before touching code.

---

## 1. The brief (from Anushka, Sept 2026)

- Third-year B.Tech CSE student. Goal: a portfolio that is **visually unique, clean, and very smooth**, and that lands Summer ’27 internships.
- Explicitly *not* wanted: the templates that flood the `emmabostian/developer-portfolios` list — gradient blobs, neon-green GSAP templates, shadcn profile cards, Brittany Chiang / Hamish Williams clones.
- Reference reels she liked: cinematic dark sites with huge type, one strong visual motif, sections that *transition* into each other, a big "contact" ending.
- Palette: black + bone/off-white, one accent (ice by default). **No photo of her anywhere.**
- Libraries welcome: Framer Motion, GSAP, Three.js — not required, but smoothness is non-negotiable.
- Projects must be data-driven so she can edit them herself later.

## 2. The concept — "Eclipse"

One motif carries the whole site: a solar eclipse.
A thin **sun** ring with a soft corona, and a black **moon** disc crossing it. Scrolling moves the moon:

| Section        | Where the eclipse is                       | Phase                          |
|----------------|--------------------------------------------|--------------------------------|
| 00 Hero        | centre, large, partly covering the name    | 0.6 — crescent                 |
| 01 Philosophy  | small, top-right                           | 0.62                           |
| 02 Stack       | hidden (r = 0, o = 0)                      | —                              |
| 03 Work        | centre of the featured block               | **1.0 — totality**, full corona |
| 04 Beyond code | hidden (o = 0)                             | 1.3 (bridging value only)      |
| 05 Contact     | small, top-right                           | 1.45 — the moon leaves         |
| Case study     | small, top-right                           | 1.0                            |

The name letters rise from behind the disc on load. Totality lands exactly on the featured project.
The contact headline ("Say hi.") has three outlined ghost copies that trail it by scroll velocity — the one idea borrowed from concept F.

Design decisions that are locked:
- **Type**: Big Shoulders (variable, 900 for display, 500 for the manifesto), Instrument Sans for body, JetBrains Mono for labels. All self-hosted from `src/fonts/`.
- **Colour tokens** (`src/app/globals.css`): ink `#070707`, ink-2 `#111010`, line `#1f1d1b`, bone `#ede8e0`, bone-2 `#b5b0a8`, dim `#6e6a64`, off `#3a3733`, accent `#cfe3ff`.
  Alternatives Anushka can swap in for the accent: gold `#d9b46a`, lilac `#b9a6f5`, sage `#a8c5a0` (change `--accent` in globals.css **and** `ACCENT` in `Eclipse.tsx`).
- No gradients, no rounded cards, no shadows, no emoji, no cursor gimmicks.

## 3. Sections (final)

1. **Hero** — ANUSHKA at ~27vw, KUMARI outlined bottom-right, role + tagline + availability, "Scroll — the moon moves".
2. **Philosophy** — three-line manifesto that lights up word by word (charcoal → bone) as it crosses the viewport; the accent phrase stays lit.
3. **Stack** — two opposite-direction marquees of the tech stack in display type, a small moon mark between items, pause on hover.
4. **Work** — featured project inside the eclipse at totality, then the remaining projects as a 3-up list. Every project opens a full case-study route.
5. **Beyond code** — a single-line strip after Work: "Co-CEO of a student-run non-profit." (moved out of Philosophy so that section stays pure manifesto).
6. **Contact** — "Say hi." with velocity ghosts, Email (click copies), GitHub, LinkedIn, Resume, footer line.

Case study (`/work/[slug]`): title, year / status / role, summary, The problem → What I built → The hard part → Outcome, Stack chips, GitHub + Live links, "Next project".

Cut on purpose: Experience/timeline (she asked to skip), blog, playground, photo.

## 4. Tech stack & why

| Piece | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TS) | static export of every route, `generateStaticParams` for case studies |
| Styling | Tailwind 4 + a few global utilities | layout only; all colour/type through tokens |
| Smooth scroll | **Lenis** (lerp 0.07) driven by GSAP's ticker | one smoothed scroll value shared by everything |
| Scroll animation | **GSAP + ScrollTrigger** | reveals, the manifesto scrub, section entrances |
| The eclipse | **React Three Fiber** — one full-screen quad with a small fragment shader | costs nothing per frame; no geometry, no lights |
| Route transition | GSAP-grown disc "veil" (`CaseLink` → `VeilRemover`) | reliable in App Router; Framer Motion's shared layout across routes is not |
| Fonts | `next/font/local` | Google Fonts is not reachable at build time in some environments, and self-hosting is faster anyway |

Smoothness rules (do not break these):
- Every animation is `transform` / `opacity` only. Nothing animates layout.
- Scroll-linked things read `scrollState` from `src/lib/scroll.ts` (written by Lenis every frame), never `window.scrollY` directly (except as a reduced-motion fallback).
- `prefers-reduced-motion` disables Lenis, the load-in, the ghosts, the marquee and every reveal; the page renders its final state.
- The eclipse canvas is `pointer-events: none` (enforced in CSS with `!important` — R3F tries to re-enable it).

## 5. Where things live

```
src/
  data/
    site.ts          ← name, links, tagline, manifesto, facts, stack rows, "now"
    projects.ts      ← ONE entry per project; order = display order; first = featured
  app/
    layout.tsx       ← fonts, SmoothScroll, Nav, Eclipse
    page.tsx         ← Hero · Philosophy · Stack · Work · Contact
    work/[slug]/     ← case-study route (static)
    globals.css      ← tokens, type utilities, marquee keyframes, status dots
  components/
    Eclipse.tsx      ← the shader + keyframe interpolation (reads data-eclipse attrs)
    SmoothScroll.tsx ← Lenis + GSAP ticker + ScrollTrigger sync
    Nav.tsx          ← fixed, mix-blend-difference, Lenis scrollTo
    CaseLink.tsx     ← link that grows the black veil, then navigates
    VeilRemover.tsx  ← fades the veil out on the destination page; handles /#hash
    CaseStudy.tsx    ← case-study layout
    sections/        ← Hero, Philosophy, Stack, Work, BeyondCode, Contact
  fonts/             ← big-shoulders.woff2, instrument-sans.woff2, jetbrains-mono.woff2
public/
  resume.pdf         ← DROP THE RESUME HERE (linked from Contact)
```

### Positioning the eclipse
Any element can carry `data-eclipse='{"x":0.5,"y":0.5,"r":0.3,"phase":0.4,"o":1,"m":{...}}'`.
`x`,`y` are viewport fractions, `r` is a fraction of `min(vw, vh)`, `phase` 0→1→1.45 moves the moon, `o` is opacity, `m` overrides for viewports under 768px. Keyframes are the elements' document tops; the shader lerps (smoothstep) between consecutive ones on the smoothed scroll value.

## 6. How to edit content (for Anushka)

- **Change a project / add one / hide one** → `src/data/projects.ts`. Copy an entry, edit fields, done. `hidden: true` hides one without deleting it. The first non-hidden entry is the featured one inside the eclipse.
- **Change your bio, links, stack, manifesto, the Beyond code line** → `src/data/site.ts`.
- **Resume** → put `resume.pdf` in `public/`.
- **Accent colour** → `--accent` in `globals.css` and `ACCENT` in `Eclipse.tsx`.
- **Nudge the eclipse** → the `data-eclipse` attribute on the section.

## 7. Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```
Deploy: Vercel (zero config) or any static host after `next build`.

## 8. Status & open items

Done (v1, 16 Sept 2026): all five sections, four case studies with real content pulled from the repos, mobile layout, reduced-motion path, build passing, verified with headless screenshots at 1440×900 and 390×844.

Done (v1.1, 17 Sept 2026): nav legibility fix, "Say hi." period fix, Beyond code split out of Philosophy into its own section — now six sections (Hero · Philosophy · Stack · Work · Beyond code · Contact) — build passing, re-verified at 1440×900 and 390×844.

Open:
- [ ] `public/resume.pdf` — Anushka uploads it.
- [ ] Project covers: `cover` is supported in the data model but no images are used yet (the site is typographic by design; add only if a still is *good*).
- [ ] OG image (`app/opengraph-image.tsx`) — a black card with the eclipse and the name.
- [ ] Custom domain + Vercel deploy.
- [ ] Optional: a `/work` index page listing all projects (nav currently scrolls to the section).
- [ ] Optional: replace the `Naap` GitHub link with a public mirror if the SIH repo stays private.

## 9. Decisions log

- Rejected concepts (kept on the design canvas for reference): A Paper & Ink (editorial light), B/D Spec Sheet (engineering drawing, light and dark), C ASCII object, F Pill (light, video pill). E Eclipse chosen; F's "Say hi." ending merged in.
- Red corona dropped for ice at Anushka's request ("too horror poster").
- Experience section dropped; the non-profit role lives in the Philosophy strip instead.
- Tech stack section added as a marquee (her request).
- Name guessed wrong early ("Ankit Aman" from the email); corrected everywhere to **Anushka Kumari**.
- Fixed nav: `mix-blend-difference` alone went illegible wherever it crossed other light-colored text (manifesto, section labels, body copy) — swapped for a solid `bg-ink/75 backdrop-blur-md` scrim.
- Fixed the "Say hi." accent period, which painted as an oversized solid block at ~345px in Big Shoulders Black — sized it independently at `0.28em`.
- Moved "Beyond code" out of the Philosophy facts row into its own strip after Work; dropped the Front/Back columns entirely since the Stack marquee already covers tech stack.
