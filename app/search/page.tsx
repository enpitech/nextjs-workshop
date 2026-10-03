import { PageHeader } from "@/components/page-header";
import { TalkSearch } from "@/components/talk-search";

// The page itself reads no data, so it prerenders. The list arrives later,
// from the browser, through GET /api/talks/search (Step 12).
export default function Search() {
  return (
    <main>
      <PageHeader eyebrow="Route Handler" title="Search talks">
        <p className="mt-2 max-w-prose text-muted">
          Each key press sends a request to <code>/api/talks/search</code>. Open the
          Network tab to watch them.
        </p>
      </PageHeader>
      <TalkSearch />
    </main>
  );
}
