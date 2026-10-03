// Break #8: shows which module graph imported this file. No directive, so it can be in either.
// The bundler gives the server graph a build of React without hooks (the "react-server" condition).
// The client graph gets the full build. The same check is how React rejects useState in a Server Component.
import * as React from "react";

export function GraphBadge({ file }: { file: string }) {
  const client = "useState" in React;
  return (
    <p className="text-sm">
      <code>{file}</code> is in the{" "}
      <span className={`rounded-md px-2 py-0.5 font-semibold text-white ${client ? "bg-danger" : "bg-green-700"}`}>
        {client ? "client graph" : "server graph"}
      </span>
    </p>
  );
}
