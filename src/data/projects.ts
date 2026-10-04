/**
 * One entry per project. Order = display order; the first one is the featured project.
 * To add a project: copy an entry, change the fields, drop a cover image in /public/projects/<slug>.jpg.
 * To hide one: set `hidden: true`.
 */
export type Project = {
  slug: string;
  title: string;
  year: string;
  status: "live" | "in-progress" | "archived";
  /** One line, shown in the Work section. */
  summary: string;
  /** Shown as small mono text. */
  stack: string[];
  /** Your actual role, honestly. */
  role: string;
  links: { github?: string; live?: string };
  /** Optional cover; if missing the case study uses a typographic cover. Path under /public. */
  cover?: string;
  /** A one- or two-word kind of thing, shown beside the number in the archive index. */
  category: string;
  /**
   * How the archive mounts this project. Each project gets a treatment drawn from what it
   * actually is, so switching projects changes the object on display, not just its label:
   *  - "chart":  survey graticule + crop marks — for work that models a physical system
   *  - "redact": no frame, quiet, the data it removes listed and struck out — for privacy work
   *  - "glow":   the interface's own colours bleed out into the room — for colour-led products
   *  - "sheets": mounted on a stack of pages — for a product whose output is a document
   * `marks` are the labels a "redact" treatment strikes out; take them from the summary.
   * `aura` is the light the artifact sits in: two colours sampled from its own screenshot
   * (main, then a smaller second light). Each treatment shapes it differently.
   */
  artifact: { treatment: "chart" | "redact" | "glow" | "sheets"; marks?: string[]; aura: [string, string] };
  /** Case-study page content. Keep it to what you actually did. */
  caseStudy: {
    problem: string;
    built: string;
    hardPart: string;
    outcome?: string;
  };
  hidden?: boolean;
};

export const projects: Project[] = [
  {
    slug: "udgam",
    cover: "/work/udgam.webp",
    category: "Modelling",
    // the steel-blue of its sea chart, deepened, and the orange of its "Open a case" button
    artifact: { treatment: "chart", aura: ["#2c5a78", "#f27116"] },
    title: "Udgam",
    year: "2026",
    status: "in-progress",
    summary:
      "Satellite forensics that traces an oil spill back to the ship that caused it. I own Stage 2: the physics that runs the ocean backwards.",
    stack: ["Python", "NumPy", "Google Earth Engine", "HYCOM", "GeoJSON", "Next.js"],
    role: "Drift & origin modelling (Stage 2 of 4) · team of six · Smart India Hackathon 2026",
    links: {
      github: "https://github.com/AkshatTm/Udgam-SIH-PS143",
      live: "http://udgam-frontend-verdict.s3-website.ap-south-1.amazonaws.com/",
    },
    caseStudy: {
      problem:
        "Coast guards know where an oil slick is going, but not where it came from. Given a slick detected in Sentinel-1 radar imagery, we needed to reconstruct where and when the oil entered the water so the next stage could shortlist vessels.",
      built:
        "A backward Lagrangian drift model. It fetches HYCOM ocean currents and wind fields, seeds particles across the detected slick, and integrates them backwards in time with an RK2 scheme at 15-minute steps. A stratified ensemble of perturbed runs turns the result into a probability cloud — never a single point — with an explicit abstain flag when the cloud is too wide to be useful.",
      hardPart:
        "The bugs that don’t crash. Fifty independent draws from N(1, 0.15) landed 3 % fast on average and pushed the whole origin cloud 1.4 km too far — every draw was legitimate, only the realised moments were off. A units error in the current field (mm/s stored as m/s) was caught by a plausibility guard before a single particle moved, then corroborated physically: the corrected field flows south along the Coromandel coast at the speed the East India Coastal Current should under the north-east monsoon. Backward integration was tested in a vortex field on purpose, because a constant field passes even with the sign bug present.",
      outcome:
        "Integrator exact to 0.000 % on a known-answer case; a 24-hour forward-then-backward round trip closes to 0.0001 km. Identical output on Linux and Windows to the last decimal.",
    },
  },
  {
    slug: "obscura",
    cover: "/work/obscura.webp",
    category: "Privacy",
    // its red, low: a darkroom safelight
    artifact: { treatment: "redact", marks: ["GPS", "Device", "Timestamp"], aura: ["#68211f", "#2a1416"] },
    title: "Obscura",
    year: "2026",
    status: "live",
    summary:
      "Strips the GPS, device and timestamp metadata your camera hides inside every photo — before anyone else sees it.",
    stack: ["Flask", "Pillow", "piexif", "Docker", "AWS EC2", "ALB", "S3", "IAM"],
    role: "Solo build, app and infrastructure",
    links: {
      github: "https://github.com/anushkaa2205/obscura",
      live: "https://obscura-0kj7.onrender.com/",
    },
    caseStudy: {
      problem:
        "A photo with no faces and no address still carries coordinates accurate to a few metres, the exact phone model and the second the shutter clicked. Messaging apps strip it silently, which is exactly why people never learn it exists elsewhere.",
      built:
        "A Flask service that reads the EXIF block, tells you which categories were present — camera, GPS, time taken — and hands back a clean copy. Deployed on AWS: a custom VPC across two availability zones, an Application Load Balancer health-checking two Dockerised EC2 instances, and an S3 bucket for clean output with a one-day lifecycle rule.",
      hardPart:
        "Privacy by design in the UI itself: Obscura never displays the actual values it finds, only the categories, so the tool can’t become the leak it’s preventing. On the infrastructure side, EC2 authenticates to S3 through an IAM instance role scoped to three actions — no access keys on the host at all.",
    },
  },
  {
    slug: "medora",
    cover: "/work/medora.webp",
    category: "Health AI",
    // its blues and the purple of "Redefined"
    artifact: { treatment: "glow", aura: ["#2f5dc1", "#d48ff5"] },
    title: "Medora",
    year: "2025",
    status: "live",
    summary:
      "An AI health assistant: conversational symptom analysis, a personal dashboard, and branded PDF reports.",
    stack: ["Node.js", "Express 5", "MongoDB", "Passport", "JWT", "Gemini", "Groq", "Three.js", "GSAP"],
    role: "Backend, auth and AI integration",
    links: {
      github: "https://github.com/anushkaa2205/symptom-checker",
      live: "https://symptom-checker-b53o.onrender.com",
    },
    caseStudy: {
      problem:
        "Symptom checkers are either a static decision tree or a chat box with no memory. We wanted one that holds a conversation, remembers the user, and produces something you could actually hand to a doctor.",
      built:
        "An Express 5 API over MongoDB with Google OAuth 2.0 and JWT sessions, rate-limited chat routes that call Groq first and fall back to Gemini, a per-user dashboard of past assessments with the conversation history fed back as context, and downloadable PDF reports. The front end uses Three.js for the DNA scene and GSAP for transitions.",
      hardPart:
        "Making two LLM providers behave like one. The chat route tries Groq, and if it errors or is rate-limited it retries the same message and history against Gemini, so the assessment still completes and the client only ever sees one reply shape — with a `source` field so we can see which model answered.",
    },
  },
  {
    slug: "specforge",
    cover: "/work/specforge.webp",
    category: "AI SaaS",
    // its violet
    artifact: { treatment: "sheets", aura: ["#7734ec", "#ad85ec"] },
    title: "SpecForge",
    year: "2026",
    status: "in-progress",
    summary:
      "Turns a five-step questionnaire into a full product spec with Claude — with real accounts, credits and a server that is the only source of truth.",
    stack: ["Next.js", "TypeScript", "Supabase", "Google OAuth", "Anthropic SDK", "next-intl"],
    role: "Built with Ankit · accounts, credits and gating",
    links: { github: "https://github.com/ankit755/specForge" },
    caseStudy: {
      problem:
        "Generating a document with an LLM is the easy part. Making “one free spec, then pay” actually enforceable — without trusting the browser — is the product.",
      built:
        "Google OAuth via Supabase, a three-table Postgres model (profiles, purchases, projects) under row-level security, and an /api/generate route that checks credits and tier server-side before a single token is streamed. Free and pack tiers run the standard model; the premium model is gated to Pro in the API, not just hidden in the UI.",
      hardPart:
        "Keeping the client stupid on purpose. The browser never holds a credit count or a “has paid” flag — it sends a session cookie and renders whatever the database returns, so there is nothing to tamper with.",
    },
  },
];

export const visibleProjects = projects.filter((p) => !p.hidden);
