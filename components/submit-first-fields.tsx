// The first step of the submit form: a title and a speaker. Rendered inside the client form.
import type { Speaker } from "@/lib/types";
import { FormField } from "./form-field";

export function SubmitFirstFields({ speakers }: { speakers: Speaker[] }) {
  return (
    <>
      <FormField label="Title">
        <input name="title" className="w-full" placeholder="Caching is opt-in" />
      </FormField>
      <FormField label="Speaker">
        <select name="speakerId" className="w-full" defaultValue="">
          <option value="" disabled>
            Pick a speaker
          </option>
          {speakers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </FormField>
    </>
  );
}
