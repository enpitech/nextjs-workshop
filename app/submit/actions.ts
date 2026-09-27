"use server";
// Confidence routing. Jev returns a category and a confidence. The action acts on the
// category by itself when the confidence is high, and asks the human when it is not.
import { updateTag } from "next/cache";
import { addTalk } from "@/lib/talks";
import { AUTO_FILE_ABOVE, triageTalk, type Triage } from "@/lib/jev";
import { CATEGORIES, type Category } from "@/lib/types";

export type SubmitState =
  | { step: "idle" }
  | { step: "error"; message: string }
  | { step: "ask"; message: string; title: string; speakerId: number; suggested: Category; triage: Triage | null }
  | { step: "done"; message: string };

const pct = (n: number) => `${Math.round(n * 100)}%`;

async function file(
  title: string,
  speakerId: number,
  category: Category,
  how: string,
): Promise<SubmitState> {
  const talk = await addTalk({ title, speakerId, category });
  updateTag("talks");
  return { step: "done", message: `Added "${talk.title}" under ${talk.category}. ${how}` };
}

export async function submitTalk(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const title = String(formData.get("title") ?? "").trim();
  const speakerId = Number(formData.get("speakerId"));
  if (title.length < 6) return { step: "error", message: "Write a title of at least six characters." };
  if (!Number.isInteger(speakerId) || speakerId < 1) return { step: "error", message: "Pick a speaker." };

  // Second pass. The human already chose a category, so Jev is not asked again.
  // The lookup narrows the form value to the union. No cast reaches the data layer.
  const picked = CATEGORIES.find((c) => c === formData.get("category"));
  if (picked) return file(title, speakerId, picked, "You chose the category.");

  let triage: Triage | null;
  try {
    triage = await triageTalk(title);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { step: "error", message: `The Jev call failed: ${reason}` };
  }

  // No API key. Treat it as zero confidence and ask the human.
  if (!triage) {
    return {
      step: "ask",
      message: "TYPESAFE_API_KEY is not set, so nothing was asked. Choose the category yourself.",
      title,
      speakerId,
      suggested: "frontend",
      triage: null,
    };
  }

  if (triage.confidence < AUTO_FILE_ABOVE) {
    return {
      step: "ask",
      message: `Jev is only ${pct(triage.confidence)} sure. Confirm the category.`,
      title,
      speakerId,
      suggested: triage.category,
      triage,
    };
  }

  return file(
    title,
    speakerId,
    triage.category,
    `${triage.model} chose "${triage.category}" at ${pct(triage.confidence)} confidence.`,
  );
}
