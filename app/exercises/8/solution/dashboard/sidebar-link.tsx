"use client";
// Exercise 8, Task 2. usePathname is a hook, so this file must be a Client Component.
// `end` works like React Router's NavLink end: match the whole path, not only the start.
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarLink({
  href,
  end,
  children,
}: {
  href: string;
  end?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = end ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "block rounded-lg px-3 py-1.5 text-sm transition-colors " +
        (active
          ? "bg-accent-soft font-bold text-ink shadow-[inset_3px_0_0_var(--color-accent)]"
          : "text-muted hover:bg-accent-soft hover:text-accent-strong")
      }
    >
      {children}
    </Link>
  );
}
