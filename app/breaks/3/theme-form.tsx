import { setTheme } from "./actions";

export function ThemeForm() {
  return (
    <form action={setTheme} className="my-3 flex gap-2 text-sm">
      <button className="rounded border px-2" name="theme" value="light">light</button>
      <button className="rounded border px-2" name="theme" value="dark">dark</button>
    </form>
  );
}
