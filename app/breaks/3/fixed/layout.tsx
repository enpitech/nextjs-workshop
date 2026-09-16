// Break #3, fixed: the read moves into a small component behind <Suspense>.
// The rest of the layout and every child page are in the static shell (◐).
import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { ThemeForm } from "../theme-form";

async function ThemeBanner() {
  const theme = (await cookies()).get("theme")?.value ?? "light";
  return <p className="text-sm">Break #3: fixed. Theme cookie: {theme}</p>;
}

export default function FixedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded border p-4">
      <Suspense fallback={<p className="text-sm">Reading theme…</p>}>
        <ThemeBanner />
      </Suspense>
      <ThemeForm />
      <p className="text-sm">
        <Link className="mr-3 underline" href="/breaks/3/fixed/a">page a</Link>
        <Link className="underline" href="/breaks/3/fixed/b">page b</Link>
      </p>
      {children}
    </div>
  );
}
