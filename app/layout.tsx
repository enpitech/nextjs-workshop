import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talks",
  description: "Next.js 16 workshop demo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="mx-auto max-w-2xl p-6 font-sans">
        <nav className="mb-8 flex gap-4 border-b pb-3 text-sm">
          <Link href="/">Talks</Link>
          <Link href="/breaks">Breaks</Link>
          <Link href="/exercises">Exercises</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
