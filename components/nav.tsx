"use client";
// usePathname is the App Router name for "where am I". It needs the client graph.
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "./nav-link";

const links = [
  { href: "/", label: "Talks" },
  { href: "/search", label: "Search" },
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
          {/* public/logo.svg is served at /logo.svg. An .svg src skips the optimizer by itself. */}
          <Image src="/logo.svg" alt="" width={28} height={28} className="rounded-lg shadow-sm" />
          Talks
        </Link>
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} active={isActive(l.href)}>
              {l.label}
            </NavLink>
          ))}
        </ul>
      </nav>
    </header>
  );
}
