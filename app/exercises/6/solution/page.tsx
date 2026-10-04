// Exercise 6, solution. The same links, against the solution handler.
const targets = [
  { id: "1", want: "200 and the speaker as JSON" },
  { id: "99", want: '404 and {"error":"No speaker 99"}' },
  { id: "abc", want: '400 and {"error":"Not a speaker id: abc"}' },
];

export default function Solution6() {
  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold">Exercise 6: solution</h1>
      <p className="mb-6 text-sm text-muted">
        A plain <code>&lt;a&gt;</code> on purpose: the browser shows the raw response. Open DevTools, Network
        tab, to read the status code.
      </p>
      <ul className="panel divide-y divide-line">
        {targets.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <a className="underline" href={`/exercises/6/solution/api/speakers/${t.id}`}>
              <code>/exercises/6/solution/api/speakers/{t.id}</code>
            </a>
            <span className="text-sm text-muted">{t.want}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
