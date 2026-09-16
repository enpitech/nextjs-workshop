"use client";
// usePathname is the App Router name for "where am I". It needs the client graph.
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Talks" },
  { href: "/breaks", label: "Breaks" },
  { href: "/exercises", label: "Exercises" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="mb-8 flex gap-4 border-b pb-3 text-sm">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={pathname === l.href ? "font-bold underline" : ""}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
