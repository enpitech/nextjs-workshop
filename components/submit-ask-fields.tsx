// The second step of the submit form: the first pass is carried over, and the
// suggested category is pre-selected. Rendered inside the client form.
import { CATEGORIES, type Category } from "@/lib/types";
import { FormField } from "./form-field";
import { GuessBars } from "./guess-bars";

export function SubmitAskFields({
  title,
  speakerId,
  suggested,
  guesses,
}: {
  title: string;
  speakerId: number;
  suggested: Category;
  guesses: [string, number][];
}) {
  return (
    <>
      {/* React resets the form after an action, so the first pass is carried in hidden fields. */}
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="speakerId" value={speakerId} />
      <div className="rounded-xl border border-line bg-paper px-4 py-3 text-sm">
        <span className="block text-xs font-medium uppercase tracking-wide text-muted">
          Title
        </span>
        <span className="mt-0.5 block font-medium">{title}</span>
      </div>
      <FormField label="Category">
        <select name="category" className="w-full" defaultValue={suggested}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FormField>
      {guesses.length > 0 && <GuessBars guesses={guesses} />}
    </>
  );
}
