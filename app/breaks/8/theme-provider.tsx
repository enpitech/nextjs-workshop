"use client";
// Break #8: the provider. Context and state only work in the client graph, so this file needs the directive.
// It renders `children` and does not import them, so they stay in the graph they came from.
import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

export const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeFrame({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <div className={`grid gap-4 rounded-2xl p-5 transition-colors ${theme === "dark" ? "bg-gray-900" : "bg-accent-soft"}`}>
      {children}
    </div>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const toggle = () => setTheme(theme === "light" ? "dark" : "light");
  return (
    <ThemeContext value={{ theme, toggle }}>
      <ThemeFrame theme={theme}>{children}</ThemeFrame>
    </ThemeContext>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
