"use client";
// Exercise 8, Task 11. The one leaf that reads the context. It sits in the layout, which is a Server Component.
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} className="w-full">
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
