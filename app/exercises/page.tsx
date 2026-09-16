import Link from "next/link";

const exercises = [
  { n: 1, title: "Fix Break #1 yourself" },
  { n: 2, title: "The boundary refactor" },
  { n: 3, title: "Fix the waterfall" },
];

export default function Exercises() {
  return (
    <main>
      <h1 className="mb-4 text-2xl font-bold">Exercises</h1>
      <p className="mb-4 text-sm text-gray-500">
        Each exercise has a README.md next to its page.tsx. Edit in place. Reset with{" "}
        <code>git checkout .</code>
      </p>
      <ul className="space-y-2">
        {exercises.map((e) => (
          <li key={e.n}>
            {e.n}. {e.title}:{" "}
            <Link className="mr-3 underline" href={`/exercises/${e.n}`}>start</Link>
            <Link className="underline" href={`/exercises/${e.n}/solution`}>solution</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
