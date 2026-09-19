"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { useLenis } from "./SmoothScroll";

const items = [
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
    const el = document.querySelector(href);
    if (!el) return;
    if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-line/70 bg-ink/75 backdrop-blur-md">
      <nav className="mono flex items-center justify-between px-5 py-6 text-bone sm:px-10">
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
        <span className="hidden text-dim md:inline">{site.availability}</span>
        <a href={home ? "#contact" : "/#contact"} onClick={(e) => go(e, "#contact")} className="link-line sm:hidden">
          Contact
        </a>
      </nav>
    </header>
  );
}
