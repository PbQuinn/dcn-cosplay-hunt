"use client";

import { UserRound, ChevronRight } from "lucide-react";
import Avatar from "./components/ui/Avatar";

// ---------------------------------------------------------------------------
// Top mission bar
// ---------------------------------------------------------------------------
export function MissionBar({ hunter, score, photoUrl, onOpenProfile }) {
    return (
        <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-parchment/10 bg-ink/90 px-4 pb-2.5 pt-[calc(10px+env(safe-area-inset-top))] backdrop-blur-md">
            <button
                onClick={onOpenProfile}
                aria-label="Open your hunter profile"
                className="flex cursor-pointer items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50"
            >
                <Avatar
                    src={photoUrl}
                    name={hunter?.character}
                    className="h-9 w-9 rounded-full text-[11px]"
                />
                <span className="rounded-lg border border-parchment/10 bg-ink-light px-2.5 py-1 font-mono text-[15px] tracking-wide text-parchment">
                    Your code: {hunter?.code ? String(hunter.code).padStart(4, "0") : "----"}
                </span>
            </button>

            <div className="ml-auto flex flex-col items-end leading-none">
                <span className="mb-0.5 font-mono text-[9.5px] uppercase tracking-widest text-parchment/50">
                    Score
                </span>
                <span className="font-mono text-xl text-sage">{score}</span>
            </div>

            <button
                onClick={onOpenProfile}
                aria-label="Your details"
                className="flex cursor-pointer items-center gap-0.5 rounded-full border border-parchment/10 bg-ink-light px-2.5 py-2 text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50"
            >
                <UserRound size={16} strokeWidth={2.25} />
                <ChevronRight size={14} strokeWidth={2.25} />
            </button>
        </header>
    );
}