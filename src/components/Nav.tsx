"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { useLenis } from "./SmoothScroll";

const items = [
  { label: "Tech stack", href: "#index" },
  { label: "Work", href: "#work" },
  { label: "Philosophy", href: "#philosophy" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const lenis = useLenis();
  const pathname = usePathname();
  const home = pathname === "/";

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!home) return; // let the link navigate to /#section
    e.preventDefault();
    const el = document.querySelector<HTMLElement>(href);
    if (!el) return;
    const ease = (t: number) => 1 - Math.pow(1 - t, 4);

    // The tech stack lives inside the aperture. Its top is the card spread; the stack only
    // exists once the hole has finished opening, at the very end of the section's scroll
    // (the stage is taller than the screen by exactly the scrub distance). Land there.
    if (href === "#index") {
      const y = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight;
      if (lenis) lenis.scrollTo(y, { duration: 1.8, easing: ease });
      else window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }

    if (lenis) lenis.scrollTo(el, { duration: 1.4, easing: ease });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="nav-scrim fixed inset-x-0 top-0 z-30 border-b border-line/70 bg-ink/75 backdrop-blur-md">
      <nav className="nav-bar mono flex items-center justify-between px-5 py-6 text-bone sm:px-10">
        <Link href="/" className="link-line">
          {site.name}
        </Link>
        <ul className="hidden gap-10 sm:flex">
          {items.map((it) => (
            <li key={it.href}>
              <a href={home ? it.href : `/${it.href}`} onClick={(e) => go(e, it.href)} className="link-line">
                {it.label}
              </a>
            </li>
          ))}
        </ul>
        <span className="nav-meta hidden text-dim md:inline">{site.availability}</span>
        <a href={home ? "#contact" : "/#contact"} onClick={(e) => go(e, "#contact")} className="link-line sm:hidden">
          Contact
        </a>
      </nav>
    </header>
  );
}
