// The TanStack Query provider lives here, not in the root layout. Only /spa/* pays for it.
// Like Break #8: the layout stays a Server Component. Providers is the client file, the pages arrive as children.
import { Providers } from "./providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
