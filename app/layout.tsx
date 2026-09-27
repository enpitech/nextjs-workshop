import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/nav";
import "./globals.css";

// The metadata export replaces <Head>. Next renders the <title> and <meta> tags.
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
      <body className="flex min-h-dvh flex-col font-sans">
        <Suspense>
          <Nav />
        </Suspense>
        <div className="fade-in mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8">
          {children}
        </div>
        <footer className="mx-auto w-full max-w-3xl px-5 py-8 text-xs text-faint sm:px-8">
          Next.js 16 workshop · demo app
        </footer>
      </body>
    </html>
  );
}
