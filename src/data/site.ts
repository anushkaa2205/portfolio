/**
 * Everything about *you* lives here. Change a value, the whole site updates.
 * Projects live in ./projects.ts.
 */
export const site = {
  name: "Anushka Kumari",
  firstName: "ANUSHKA",
  lastName: "KUMARI",
  role: "Third-year B.Tech CSE · India",
  tagline: "Mostly, I am just very curious with a keyboard.",
  availability: "Open to internships",
  location: "India · UTC+5:30",

  email: "anushkaa22kumari@gmail.com",
  links: {
    github: "https://github.com/anushkaa2205",
    linkedin: "https://www.linkedin.com/in/anushka-a31989344/",
    resume: "/resume.pdf", // drop your PDF in /public as resume.pdf
  },

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
   * The tech stack panel (the aperture reveals it). Four rows; each row shows its list on hover.
   * `lead` is the big word, `tail` is the dimmer rest of the sentence. Only list what you would
   * happily be asked about in an interview.
   */
  techStack: [
    {
      lead: "Languages",
      tail: "I write in",
      items: ["C++", "Java", "Python", "TypeScript", "JavaScript", "SQL"],
    },
    {
      lead: "Technologies",
      tail: "I work with",
      items: [
        "HTML", "CSS", "React", "Next.js", "Tailwind CSS", "GSAP", "Three.js", "Framer Motion",
        "Node.js", "Express.js", "Google OAuth",
      ],
    },
    {
      lead: "Platforms",
      tail: "I build on",
      items: ["AWS", "Render", "Supabase", "PostgreSQL", "MongoDB", "Google Earth Engine", "Docker"],
    },
    {
      lead: "Tools",
      tail: "I work with",
      items: ["Git", "GitHub", "Postman", "Figma"],
    },
  ],
} as const;

export type Site = typeof site;
