"use client";
import { useEffect } from "react";

// Demo tooling, not part of the lesson. After hydration, it marks each .demo-box as
// "server" if the inline script in demo.tsx tagged that node, or "browser" if React made it.
// A data-* attribute in the server HTML would trigger React's attribute warnings, so the tag is a JS property.
export function Paint() {
  useEffect(() => {
    const boxes = () => document.querySelectorAll<HTMLElement>(".demo-box");
    const isServer = (el: HTMLElement) => (el as HTMLElement & { __server?: boolean }).__server;
    // A client-side navigation gets no server HTML, so the inline script never runs and nothing hydrates.
    const navigated = ![...boxes()].some(isServer);
    const paint = () =>
      boxes().forEach((el) => {
        const origin = navigated ? "navigation" : isServer(el) ? "server" : "browser";
        // Write only on a change. Other DOM watchers (browser extensions) can react to each write.
        if (el.dataset.origin !== origin) el.dataset.origin = origin;
      });
    paint();
    // React can rebuild a Suspense boundary after this effect runs. Paint again when it does.
    const observer = new MutationObserver(paint);
    observer.observe(document.querySelector("main")!, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
