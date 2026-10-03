import { getSpeakers } from "@/lib/speakers";
import { AUTO_FILE_ABOVE } from "@/lib/jev";
import { PageHeader } from "@/components/page-header";
import { SubmitForm } from "./submit-form";

export default async function Submit() {
  const speakers = await getSpeakers();
  return (
    <main>
      <PageHeader eyebrow="Call for talks" title="Submit a talk">
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          The Server Action sends the title to Jev, a model that returns a typed
          answer and a confidence instead of text. Jev sorts the talk into one of
          eighteen technology categories. Above{" "}
          {Math.round(AUTO_FILE_ABOVE * 100)}% confidence the action files the
          talk by itself. Below it, you choose the category.
        </p>
      </PageHeader>
      <div className="panel p-6 sm:p-8">
        <SubmitForm speakers={speakers} />
      </div>
    </main>
  );
}
