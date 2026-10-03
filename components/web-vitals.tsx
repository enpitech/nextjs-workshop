"use client";

import { useReportWebVitals } from "next/web-vitals";

// Dev runs effects twice (Strict Mode), so each metric would log twice.
const logged = new Set<string>();

// Module scope keeps the callback reference stable, as the docs ask.
const logMetric: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  if (logged.has(metric.name)) return;
  logged.add(metric.name);

  if (metric.name === "TTFB") {
    // The same two numbers as curl in 6a: first byte, and the end of the stream.
    const nav = metric.entries[0] as PerformanceNavigationTiming;
    console.log(`[web-vitals] TTFB ${Math.round(metric.value)} ms, total ${Math.round(nav.responseEnd)} ms`);
    return;
  }
  const value = metric.name === "CLS" ? metric.value.toFixed(3) : `${Math.round(metric.value)} ms`;
  console.log(`[web-vitals] ${metric.name} ${value}`);
};

// Reports on a full page load only. A client-side navigation does not log again.
export function WebVitals() {
  useReportWebVitals(logMetric);
  return null;
}
