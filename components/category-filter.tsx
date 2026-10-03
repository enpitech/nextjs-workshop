// The category dropdown. It is controlled: the parent owns the state and passes value and onChange.
import { CATEGORIES, type Talk } from "@/lib/types";

type Value = Talk["category"] | "all";

export function CategoryFilter({
  value,
  onChange,
}: {
  value: Value;
  onChange: (value: Value) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-muted">Category</span>
      <select
        value={value}
        onChange={(e) => onChange(CATEGORIES.find((c) => c === e.target.value) ?? "all")}
        className="min-w-48"
      >
        <option value="all">all</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}
