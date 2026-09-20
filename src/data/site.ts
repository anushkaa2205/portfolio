/**
 * Everything about *you* lives here. Change a value, the whole site updates.
 * Projects live in ./projects.ts.
 */
export const site = {
  name: "Anushka Kumari",
  firstName: "ANUSHKA",
  lastName: "KUMARI",
  role: "Third-year B.Tech CSE · India",
  tagline:
    "I build interfaces with weight and timing — the kind you feel before you read — and the backend that keeps them at 60 fps.",
  availability: "Open to Summer ’27 internships",
  location: "India · UTC+5:30",

  email: "anushkaa22kumari@gmail.com",
  links: {
    github: "https://github.com/anushkaa2205",
    linkedin: "https://www.linkedin.com/in/anushka-a31989344/",
    resume: "/resume.pdf", // drop your PDF in /public as resume.pdf
  },

  /** The manifesto on the Philosophy section. Each string is one line; words light up on scroll. */
  manifesto: <string[]>[
    "Building systems that work.",
  ],
  /** The word(s) in the manifesto that take the accent colour. */
  manifestoAccent: <string[]>["work."],

  /** Shown in its own strip after Work. */
  beyondCode: "Co-CEO of a student-run non-profit.",

  /** The tech-stack marquee. Two rows, opposite directions. */
  stack: {
    rowA: ["TypeScript", "React", "Next.js", "Tailwind", "GSAP", "Three.js", "Framer Motion", "Node.js", "Express"],
    rowB: ["Python", "Flask", "NumPy", "Docker", "AWS", "PostgreSQL", "MongoDB", "Supabase", "Git"],
  },

  /** What you're working on right now (shown in the hero footer and the Now slot). */
  now: "Building SpecForge — AI-generated product specs, with real accounts and credits.",
  /** The three-up strip revealed inside the aperture. Keep these defensible. */
  stats: [
    {
      value: "04",
      label: "Projects shipped",
      meta: "Udgam \u00b7 Obscura \u00b7 Medora \u00b7 SpecForge",
    },
    {
      value: "02",
      label: "Live in production",
      meta: "Obscura \u00b7 Medora",
    },
    {
      value: "AWS",
      label: "VPC \u00b7 ALB \u00b7 two AZs",
      meta: "Obscura \u2014 load-balanced EC2, IAM role to S3",
    },
  ],
} as const;

export type Site = typeof site;
