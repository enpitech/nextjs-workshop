"use client";
// Break #8: the one leaf that reads the context. It sits inside the page, which is a Server Component.
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>Theme: {theme}. Click to switch.</button>;
}
