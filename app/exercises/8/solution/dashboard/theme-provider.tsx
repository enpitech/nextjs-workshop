"use client";
// Exercise 8, Task 11. The provider. Context and state work only in the client graph, so this file needs the directive.
// It renders `children` and does not import them. The pages arrive as `children`, already rendered on the server,
// so they stay Server Components inside this Client Component.
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The server has no localStorage, so the first render is always "dark", on the server and in the browser.
  const [theme, setTheme] = useState<Theme>("dark");

  // On mount, in the browser only: load the saved choice. This runs after the first paint,
  // so a saved "light" shows the dark frame for a moment first.
  // The lint rule warns about setState in an effect. Here it is on purpose: the saved value exists only
  // in the browser, so the first render must match the server, and the second render shows the choice.
  useEffect(() => {
    const saved = localStorage.getItem("exercise-8-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  // Save in the click handler, not in an effect. An effect on `theme` would also run on mount,
  // and write "dark" over the saved choice before the load above could read it.
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("exercise-8-theme", next);
  };

  return (
    <ThemeContext value={{ theme, toggle }}>
      <div data-theme={theme} className="rounded-2xl bg-paper p-6 text-ink transition-colors">
        {children}
      </div>
    </ThemeContext>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
