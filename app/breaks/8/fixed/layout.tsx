// Break #8, fixed: the layout is a Server Component again. The state lives in ThemeProvider.
// Panel is imported here, in the server graph, and reaches the provider as `children`.
import { ThemeProvider } from "../theme-provider";
import { Panel } from "../panel";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Panel />
      {children}
    </ThemeProvider>
  );
}
