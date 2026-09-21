/**
 * Everything about *you* lives here. Change a value, the whole site updates.
 * Projects live in ./projects.ts.
 */
export const site = {
  name: "Anushka Kumari",
  firstName: "ANUSHKA",
  lastName: "KUMARI",
  role: "Third-year B.Tech CSE · India",
  tagline: "Mostly I am just very curious with a keyboard.",
  availability: "Open to internships",
  location: "India · UTC+5:30",

  email: "anushkaa22kumari@gmail.com",
  links: {
    github: "https://github.com/anushkaa2205",
    linkedin: "https://www.linkedin.com/in/anushka-a31989344/",
    resume: "/resume.pdf", // drop your PDF in /public as resume.pdf
  },

  /** The manifesto on the Philosophy section. Each string is one line; words light up on scroll. */
  manifesto: <string[]>[
    "I'm still a student, and I plan to stay one. I care about the space between the code and the person using it. I'd rather build one thing that feels right than ten that just work. I sweat the details most people scroll past, because that's where the feeling lives. Every project teaches me something, and I let it.",
  ],
  /** The word(s) in the manifesto that take the accent colour. */
  manifestoAccent: <string[]>["feels right"],

  /** Shown in its own strip after Work. */
  beyondCode: "Co-CEO of a student-run non-profit.",

  /** The tech-stack marquee. Two rows, opposite directions. */
  stack: {
    rowA: ["TypeScript", "React", "Next.js", "Tailwind", "GSAP", "Three.js", "Framer Motion", "Node.js", "Express"],
    rowB: ["Python", "Flask", "NumPy", "Docker", "AWS", "PostgreSQL", "MongoDB", "Supabase", "Git"],
  },

  /** What you're working on right now (shown in the hero footer and the Now slot). */
  now: "Building SpecForge — AI-generated product specs, with real accounts and credits.",
  /**
   * The tech stack panel (the aperture reveals it). Three rows; each row shows its list on hover.
   * `lead` is the big word, `tail` is the dimmer rest of the sentence. Only list what you would
   * happily be asked about in an interview.
   */
  techStack: [
    {
      lead: "Technologies",
      tail: "I work with",
      items: [
        "Python", "TypeScript", "React", "Next.js", "Node.js", "Express", "Flask",
        "Tailwind", "GSAP", "Three.js", "Framer Motion", "NumPy",
      ],
    },
    {
      lead: "Platforms",
      tail: "I build on",
      items: [
        "AWS", "EC2", "ALB", "VPC", "S3", "IAM", "Render", "Supabase", "PostgreSQL",
        "MongoDB", "HYCOM", "Anthropic API", "Gemini", "Groq", "Google OAuth",
      ],
    },
    {
      lead: "Tools",
      tail: "I work with",
      items: ["Git", "GitHub", "Docker", "Google Earth Engine"],
    },
  ],
} as const;

export type Site = typeof site;
