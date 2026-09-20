"use client";

import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Check if current route is the display page
  const isDisplayPage = pathname?.endsWith("/display");

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen min-h-dvh max-h-dvh bg-grain">
        {!isDisplayPage && (
          <header className="border-b border-parchment/10">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
              <a href="/" className="flex items-baseline gap-2">
                <span className="font-display text-xl font-bold tracking-tight">
                  Cosplay Safari
                </span>
                <span className="eyebrow hidden sm:inline">Field Guide Edition</span>
              </a>
              <nav className="font-mono text-xs uppercase tracking-widest text-parchment/60">
                <a href="/admin" className="hover:text-flare">Admin</a>
              </nav>
            </div>
          </header>
        )}

        <main className={isDisplayPage ? "" : "mx-auto max-w-5xl px-6"}>
          {children}
        </main>
      </body>
    </html>
  );
}