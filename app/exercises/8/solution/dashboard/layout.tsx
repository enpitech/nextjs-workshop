// Exercise 8, Tasks 1, 2 and 9. A layout wraps every page under /dashboard.
// It stays mounted when you click from page to page, so the note keeps its text.
// Swap one <Link> for a plain <a> and the note is gone after the click: a full page load.
import type { Metadata } from "next";
import { Suspense } from "react";
import { SidebarLink } from "./sidebar-link";

const base = "/exercises/8/solution/dashboard";

// Task 9: a fixed title for every page that sets none of its own.
export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Organizer dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-[12rem_1fr]">
        <aside className="space-y-4">
          {/* usePathname is a read that waits for the request, so it needs a boundary. */}
          <Suspense>
            <nav className="space-y-1">
              <SidebarLink href={base} end>
                Overview
              </SidebarLink>
              <SidebarLink href={`${base}/talks`}>Talks</SidebarLink>
            </nav>
          </Suspense>
          <textarea
            placeholder="A note for the team"
            rows={4}
            className="w-full rounded-[0.625rem] border border-line-strong bg-surface px-3 py-2 text-sm"
          />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
