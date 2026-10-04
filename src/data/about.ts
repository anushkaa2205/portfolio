/**
 * The About section ("The curiosity archive"). Every line here is Anushka's own copy;
 * change it here and the section follows. Keep it honest: no invented facts, metrics or
 * experience.
 */
export const about = {
  label: "About me",
  aside: "The curiosity archive",

  /** The opening statement, one entry per line. The last line takes the accent. */
  headline: ["It started", "with a little", "curiosity."],
  annotation: ["Same curious person.", "Just building now."],
  fragment: ["//", "Code", "Ideas", "Bugs", "Better versions", "//"],

  story: {
    id: "about-story",
    index: "My story",
    opening: "Then came the code, the bugs, and the unreasonable urge to make things work.",
    intro: "I'm Anushka, a CSE student building full-stack products and learning something new with every build.",
    exploringLabel: "Currently exploring",
    exploring: ["Full-stack products", "System design", "Better user experiences"],
  },

  doing: {
    id: "about-doing",
    index: "What I'm doing",
    rows: [
      { label: "Building", text: "Full-stack products, from the first component to the backend." },
      { label: "Exploring", text: "Backend systems, architecture, and what makes software scale." },
      { label: "Practising", text: "Turning unfamiliar problems into things I can actually build." },
    ],
  },

  values: {
    id: "about-values",
    index: "Things I value",
    items: [
      { title: "Understanding over shortcuts.", text: "I'd rather understand why something works than blindly copy what does." },
      { title: "Details aren't decoration.", text: "The little decisions shape how a product feels to use." },
      { title: "Build. Break. Understand.", text: "A working solution is good. Knowing how to make it better is the point." },
    ],
  },

  learning: {
    id: "about-learning",
    index: "Always learning",
    statement: "The next build is never the same.",
    text: "New problems. New tools. A few questionable debugging decisions. Always something to take away.",
    sequence: ["Build", "Question", "Iterate", "Repeat"],
  },

  /** The quiet closing signature. */
  strip: ["Build", "Learn", "Solve", "Repeat"],
} as const;
