import Link from "next/link";

const breaks = [
  { n: 1, title: "A function crosses the boundary", routes: ["broken", "fixed"] },
  { n: 2, title: "The barrel-file trap", routes: ["broken", "fixed"] },
];

export default function Breaks() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Breaks</h1>
      <ul className="space-y-2">
        {breaks.map((b) => (
          <li key={b.n}>
            #{b.n} {b.title}:{" "}
            {b.routes.map((r) => (
              <Link key={r} className="mr-3 underline" href={`/breaks/${b.n}/${r}`}>
                {r}
              </Link>
            ))}
          </li>
        ))}
      </ul>
    </main>
  );
}
