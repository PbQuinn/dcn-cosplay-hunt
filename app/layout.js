import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata = {
  title: "Cosplay Hunt | Spot the Cosplay",
  description: "Field guide bingo for spotting cosplayers at your convention.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-grain">
        <header className="border-b border-parchment/10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <a href="/" className="flex items-baseline gap-2">
              <span className="font-display text-xl font-bold tracking-tight">
                Cosplay Hunt
              </span>
              <span className="eyebrow hidden sm:inline">Field Guide Edition</span>
            </a>
            <nav className="font-mono text-xs uppercase tracking-widest text-parchment/60">
              <a href="/admin" className="hover:text-flare">Admin</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-4">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 py-4 text-xs text-parchment/40">
          Built for spotting cosplayers, one square at a time.
        </footer>
      </body>
    </html>
  );
}
