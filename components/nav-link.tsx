// One item of the top nav. The parent decides which link is active.
import Link from "next/link";

export function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={
          "rounded-full px-3 py-1.5 transition-colors " +
          (active
            ? "bg-accent text-white"
            : "text-muted hover:bg-accent-soft hover:text-accent-strong")
        }
      >
        {children}
      </Link>
    </li>
  );
}
