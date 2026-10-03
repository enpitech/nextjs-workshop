"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// During hydration React uses the third function, so the browser also renders "server" first.
// The HTML matches. Then React renders again with the second function and shows "browser".
export function WhereAmI() {
  const where = useSyncExternalStore(subscribe, () => "browser", () => "server");
  return <p>Rendered in the {where}</p>;
}
