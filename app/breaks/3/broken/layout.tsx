// Break #3: one request-time read in a layout. Every route under it pays.
// `instant = false` lets the build pass and marks the routes ƒ (dynamic).
// Delete that line and the build fails with the [stream] [cache] [block] error.
import Link from "next/link";
import { cookies } from "next/headers";
import { ThemeForm } from "../theme-form";

export const instant = false;

export default async function BrokenLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("theme")?.value ?? "light";
  return (
    <div className={theme === "dark" ? "rounded bg-gray-900 p-4 text-white" : "rounded border p-4"}>
      <p className="text-sm">Break #3: broken. Theme cookie: {theme}</p>
      <ThemeForm />
      <p className="text-sm">
        <Link className="mr-3 underline" href="/breaks/3/broken/a">page a</Link>
        <Link className="underline" href="/breaks/3/broken/b">page b</Link>
      </p>
      {children}
    </div>
  );
}
