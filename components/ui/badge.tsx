export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-gray-200 px-2 py-0.5 text-xs">{children}</span>
  );
}
