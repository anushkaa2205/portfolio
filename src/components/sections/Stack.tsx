import { site } from "@/data/site";

/** A small moon mark used as the separator between items. */
function Moon({ phase = 0.5 }: { phase?: number }) {
  const off = (1 - phase) * 14;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="mx-6 shrink-0 sm:mx-8">
      <circle cx="9" cy="9" r="8" fill="none" stroke="var(--accent)" strokeWidth="1" />
      <circle cx={9 + off} cy="9" r="7.8" fill="var(--ink)" />
    </svg>
  );
}

function Row({ items, dir, phase }: { items: readonly string[]; dir: "left" | "right"; phase: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee overflow-hidden border-t border-line py-6 sm:py-8">
      <div className={`marquee-track ${dir === "left" ? "marquee-left" : "marquee-right"}`}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span
              className="disp whitespace-nowrap text-bone"
              style={{ fontSize: "clamp(40px, 6vw, 84px)", lineHeight: 1 }}
            >
              {item}
            </span>
            <Moon phase={phase} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Stack() {
  return (
    <section
      id="stack"
      className="relative py-24 sm:py-32"
      data-eclipse='{"x":0.5,"y":0.5,"r":0.0,"phase":0.8,"o":0}'
      aria-label="Tech stack"
    >
      <div className="mono mb-8 flex items-center justify-between px-5 sm:px-10">
        <span className="text-accent">04 — Stack</span>
        <span className="text-dim">Hover to pause</span>
      </div>
      <Row items={site.stack.rowA} dir="left" phase={0.45} />
      <Row items={site.stack.rowB} dir="right" phase={0.8} />
      <div className="border-t border-line" />
    </section>
  );
}
