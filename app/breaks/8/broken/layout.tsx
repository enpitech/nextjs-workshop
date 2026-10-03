"use client";
// Break #8: the provider state was written into the layout, so the layout needs "use client".
// Now everything this file imports is in the client graph: Panel ships to the browser.
// The page is not imported here. Next passes it in as `children`, so it stays a Server Component.
import { useState } from "react";
import { ThemeContext, ThemeFrame } from "../theme-provider";
import { Panel } from "../panel";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggle = () => setTheme(theme === "light" ? "dark" : "light");
  return (
    <ThemeContext value={{ theme, toggle }}>
      <ThemeFrame theme={theme}>
        <Panel />
        {children}
      </ThemeFrame>
    </ThemeContext>
  );
}
