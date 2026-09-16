"use server";
import { cookies } from "next/headers";

export async function setTheme(formData: FormData) {
  const theme = String(formData.get("theme"));
  (await cookies()).set("theme", theme);
}
