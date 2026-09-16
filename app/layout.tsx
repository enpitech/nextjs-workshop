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
      <body className="mx-auto max-w-2xl p-6 font-sans">
        <Suspense>
          <Nav />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
