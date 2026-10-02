# Anushka Kumari — Portfolio

My personal portfolio: a few projects with case studies, the tech stack I work with, and a way to get in touch.

**Built with** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · GSAP · Lenis

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

| Command         | What it does                  |
| --------------- | ----------------------------- |
| `npm run dev`   | Start the dev server          |
| `npm run build` | Production build              |
| `npm run start` | Serve the production build    |
| `npm run lint`  | Run ESLint                    |

## Editing the content

| To change                          | Edit                                  |
| ---------------------------------- | ------------------------------------- |
| Name, links, tagline, tech stack   | `src/data/site.ts`                    |
| Projects and their case studies    | `src/data/projects.ts`                |
| Project cover images               | `public/work/`                        |
| Resume                             | `public/resume.pdf`                   |

## Structure

```
src/
  app/            routes, layout, global styles
  components/     nav, sections, scroll and animation
  data/           site and project content
  lib/            small shared helpers
public/           images, video and the resume
```
