// Break #7: the page frame for the hydration demo. A Server Component, so it ships no JS.
// Each .demo-box gets a green outline if its DOM node came from the server HTML,
// and a red outline if React threw the server node away and made a new one in the browser.
import { Suspense } from "react";
import { Paint } from "./paint";

// Runs while the browser parses the HTML, before React hydrates.
// It tags every box that exists now. Those nodes are the server's.
const markServerNodes = `document.querySelectorAll(".demo-box").forEach(function (el) { el.__server = true; });`;

const outlines = `
.demo-box { outline: 3px solid transparent; outline-offset: 4px; position: relative; }
.demo-box[data-origin]::after { position: absolute; top: -0.75rem; right: 0.75rem; padding: 0 0.4rem; font-size: 0.7rem; font-weight: 600; color: white; border-radius: 0.25rem; }
.demo-box[data-origin="server"] { outline-color: #15803d; }
.demo-box[data-origin="server"]::after { content: "server HTML"; background: #15803d; }
.demo-box[data-origin="browser"] { outline-color: var(--color-danger); }
.demo-box[data-origin="browser"]::after { content: "made in the browser"; background: var(--color-danger); }
.demo-box[data-origin="navigation"] { outline: 3px dashed var(--color-faint); }
.demo-box[data-origin="navigation"]::after { content: "client navigation: reload the page"; background: var(--color-muted); }
`;

export function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main>
      <style>{outlines}</style>
      <h1 className="mb-8 text-2xl font-bold">{title}</h1>
      <div className="grid gap-8">
        <section className="demo-box panel p-5">
          <h2 className="font-medium">Outside the Suspense boundary</h2>
          <p className="text-sm text-muted">Server Component. React hydrates this node and keeps it.</p>
        </section>
        <Suspense>
          <section className="demo-box panel p-5">
            <h2 className="font-medium">Inside the Suspense boundary</h2>
            <p className="text-sm text-muted">Server Component, next to the client component below.</p>
          </section>
          <div className="demo-box panel p-5">{children}</div>
        </Suspense>
      </div>
      <script dangerouslySetInnerHTML={{ __html: markServerNodes }} />
      <Paint />
    </main>
  );
}
