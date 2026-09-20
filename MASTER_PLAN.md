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

## 2. The concept — "Aperture"

*(v2, 20 Sept 2026. The previous concept was "Eclipse" — a shader sun/moon driven by scroll.
It is not deleted: `src/components/Eclipse.tsx` is intact and the `data-eclipse` attributes are
still on Hero, Philosophy and Stack. Re-mounting it is two lines in `layout.tsx`. The v1.1 tree
is also kept whole under `_backup-v1.1-eclipse/` and in commit `d61910c`.)*

One motif carries the site: a **hole that opens**.

A small bone-coloured disc sits on black. Scroll, and it grows until it has swallowed the
viewport, revealing the index strip that was already inside it. That is the whole trick — the
numbers are not faded in over a finished panel, they are behind the hole the entire time and
the hole simply gets big enough to show them.

The same masking idea is then reused at three different scales, which is what makes it read as
one system rather than a pile of effects:

| Where | The mask |
|---|---|
| 01 Index | a clip-path circle grows from 6vmax to 170vmax, revealing the bone panel |
| 02 Work | each project title rises out of an `overflow: hidden` line box, with an outlined ghost settling behind it |
| 03 Philosophy | words brighten from `--off` to `--bone` as the scrub crosses them (unchanged from v1) |
| 06 Contact | "Say hi." with outlined ghosts trailing by scroll velocity (unchanged from v1) |
| Case study | the disc veil grows to cover, then the route changes (unchanged from v1) |

Design decisions that are locked (unchanged from v1 unless noted):
- **Type**: Big Shoulders (900 display, 500 sub), Instrument Sans body, JetBrains Mono labels. Self-hosted.
- **Colour tokens**: ink `#070707`, ink-2 `#111010`, line `#1f1d1b`, bone `#ede8e0`, bone-2 `#b5b0a8`,
  dim `#6e6a64`, off `#3a3733`, accent `#cfe3ff`.
- **The one inversion.** The Index panel is the only light section on the page. It is the payoff of
  the aperture and it should stay the only one, or it stops being an event.
- No gradients, no rounded cards, no shadows, no emoji, no cursor gimmicks.

### The nav has to invert
The fixed nav uses a dark scrim (`bg-ink/75`). Over the bone Index panel that puts dark text on a
dark scrim over a light page — illegible. `Aperture.tsx` toggles `html.nav-light`, and `globals.css`
restyles `.nav-scrim` / `.nav-bar` / `.nav-meta` for it.

The toggle window is deliberately **not** the animation's range. The scrub timeline ends at
`bottom bottom` — where the sticky panel unsticks — but the panel then stays on screen, under the
nav, for a further viewport-height while it scrolls away. The trigger runs `top top-=400` →
`bottom top+=100` instead. Under reduced motion there is no hole, so the start becomes `top top`.
**If you change the aperture's height, re-check this window.**

## 3. Sections (final)

0. **Hero** — ANUSHKA at ~27vw, KUMARI outlined bottom-right, role + tagline + availability.
1. **Index** (`Aperture.tsx`) — the hole opens onto three figures: 04 projects shipped, 02 live in
   production, AWS (VPC · ALB · two AZs). Sourced from `site.stats`. Nothing fades back out; the
   panel scrolls away with its content intact, or the tail of the section is a screen of empty bone.
2. **Work** (`sections/Work.tsx`) — a horizontal rail, one project per screen, under a sticky
   viewport. Progress line, live index counter, snap so it rests on a whole project rather than
   between two half-panels. Below 768px it degrades to a plain vertical stack: no pin, no
   horizontal scroll, everything already visible.
3. **Philosophy** — the three-line manifesto, word-by-word scrub. Unchanged.
4. **Stack** — two opposite-direction marquees. Unchanged.
5. **Beyond code** — single-line strip. Unchanged.
6. **Contact** — "Say hi." with velocity ghosts. Unchanged.

Case study (`/work/[slug]`): unchanged.

Cut on purpose: Experience/timeline, blog, playground, photo.

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
    Aperture.tsx     ← the Index section: the clip-path hole + the nav-light toggle
    Eclipse.tsx      ← v1 shader, NO LONGER MOUNTED (kept so the eclipse can be restored)
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

Done (v2, 20 Sept 2026): concept changed from Eclipse to Aperture at Anushka's request after a
reference reel. Eclipse unmounted (not deleted). New `Aperture.tsx` Index section, `Work.tsx`
rebuilt as a snapping horizontal rail, nav inversion over the light panel, sections renumbered,
page order now Hero · Index · Work · Philosophy · Stack · Beyond code · Contact. `tsc --noEmit`
clean, `next build` passes, all four case studies still prerender. Verified with headless
screenshots at 1440x900 and 390x844, plus a reduced-motion pass (clip-path none, all reveals at
their final state, rail stacked, no console errors).

Open:
- [ ] `public/resume.pdf` — Anushka uploads it.
- [ ] Project covers: `cover` is supported in the data model but no images are used yet (the site is typographic by design; add only if a still is *good*).
- [ ] OG image (`app/opengraph-image.tsx`) — a black card with the eclipse and the name.
- [ ] Custom domain + Vercel deploy.
- [ ] Optional: a `/work` index page listing all projects (nav currently scrolls to the section).
- [ ] Optional: replace the `Udgam` GitHub link with a public mirror if the SIH repo stays private.

## 9. Decisions log

- **v2: Eclipse → Aperture.** Anushka asked for the motion system from an Instagram reel
  (@andrewwdominic). Four of its six moves already existed here and in a more developed form
  (word-scrub, marquee, ghost type, growing-disc veil); what was genuinely missing was a stat
  strip and a horizontal project rail. The advice was to add those two and keep Eclipse, because
  two circular motifs — a veil disc, a section disc and a moon — read as noise. Anushka chose to
  replace Eclipse outright. Done as asked, but built on her own tokens and type rather than
  copying the reference site, and Eclipse was unmounted rather than deleted.
- **Stat figures** are `04 projects / 02 live / AWS VPC·ALB·2AZs` — all derivable from
  `projects.ts`, chosen over vanity counts because they survive an interview question.
- **The rail snaps.** Without it, scroll rests between two half-panels and text clips at the
  viewport edge. Content is also capped at `max-w-[1180px]` and centred so a partial panel shows
  margin, not a sliced word.
- **Sticky, never `pin: true`.** ScrollTrigger's pin fights Lenis. Both the aperture and the rail
  use CSS `position: sticky` with a tall parent instead.
- **`--ap-r` is unitless.** The clip-path does `calc(var(--ap-r) * 1vmax)` so GSAP only ever
  interpolates a plain number — interpolating `6vmin → 170vmax` does not work.

- Rejected concepts (kept on the design canvas for reference): A Paper & Ink (editorial light), B/D Spec Sheet (engineering drawing, light and dark), C ASCII object, F Pill (light, video pill). E Eclipse chosen; F's "Say hi." ending merged in.
- Red corona dropped for ice at Anushka's request ("too horror poster").
- Experience section dropped; the non-profit role lives in the Philosophy strip instead.
- Tech stack section added as a marquee (her request).
- Name guessed wrong early ("Ankit Aman" from the email); corrected everywhere to **Anushka Kumari**.
- Fixed nav: `mix-blend-difference` alone went illegible wherever it crossed other light-colored text (manifesto, section labels, body copy) — swapped for a solid `bg-ink/75 backdrop-blur-md` scrim.
- Fixed the "Say hi." accent period, which painted as an oversized solid block at ~345px in Big Shoulders Black — sized it independently at `0.28em`.
- Moved "Beyond code" out of the Philosophy facts row into its own strip after Work; dropped the Front/Back columns entirely since the Stack marquee already covers tech stack.
