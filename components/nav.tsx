"use client";
// usePathname is the App Router name for "where am I". It needs the client graph.
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Talks" },
  { href: "/breaks", label: "Breaks" },
  { href: "/exercises", label: "Exercises" },
  { href: "/submit", label: "Submit" },
  { href: "/agent", label: "Agent" },
];

export function Nav() {
  const pathname = usePathname();
  // "/" is active only on the home page and the talk pages. Every other link owns its prefix.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/talks") : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between gap-6 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-ink">
          <span className="grid size-7 place-items-center rounded-lg bg-accent text-xs font-bold text-white shadow-sm">
            T
          </span>
          Talks
        </Link>
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "rounded-full px-3 py-1.5 transition-colors " +
                    (active
                      ? "bg-ink text-white"
                      : "text-muted hover:bg-accent-soft hover:text-accent-strong")
                  }
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
