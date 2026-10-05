"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { initialsFor } from "../utils/hunterUtils";

// ---------------------------------------------------------------------------
// Target card — the "viewfinder" signature element
//
// The scanline relies on a `scan` keyframe/animation living in
// tailwind.config.js (see note at the bottom of this file) so it — and its
// timing/color — can be tweaked centrally instead of inline. `motion-safe:`
// means it's skipped entirely under prefers-reduced-motion for free.
// ---------------------------------------------------------------------------
export function TargetCard({ target, captured, onOpenInfo, onOpenCapture }) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(target?.invisible) && !errored;

  const handleInfoClick = () => {
    if (typeof onOpenInfo === "function") {
      onOpenInfo(target?.app_uid);
    }
  };

  const handleImageError = (e) => {
    console.error("%c[TargetCard Error] Failed to load image:", "color: #ef4444; font-weight: bold;", {
      app_uid: target?.app_uid,
      character: target?.character,
      attemptedUrl: target?.photoUrl,
      nativeEvent: e
    });
    setErrored(true);
  };

  const handleCaptureClick = () => {
    if (captured) {
      return;
    }

    if (typeof onOpenCapture === "function") {
      onOpenCapture(target);
    }
  };

  return (
    <li className="flex w-[76vw] max-w-[320px] flex-none snap-center flex-col gap-2.5 rounded-2xl border border-parchment/10 bg-ink-light p-2.5">
      <button
        onClick={handleInfoClick}
        aria-label={`View details for ${target?.character}`}
        className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-xl bg-ink"
      >
        {showImage ? (
          <img
            src={target?.photoUrl}
            alt={target?.character}
            onError={handleImageError}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-sm text-parchment/50">
            {initialsFor(target?.character)}
          </div>
        )}

        <span className="absolute left-2.5 top-2.5 h-5 w-5 rounded-tl-sm border-l-2 border-t-2 border-parchment/85" />
        <span className="absolute right-2.5 top-2.5 h-5 w-5 rounded-tr-sm border-r-2 border-t-2 border-parchment/85" />
        <span className="absolute bottom-2.5 left-2.5 h-5 w-5 rounded-bl-sm border-b-2 border-l-2 border-parchment/85" />
        <span className="absolute bottom-2.5 right-2.5 h-5 w-5 rounded-br-sm border-b-2 border-r-2 border-parchment/85" />
        <span className="motion-safe:animate-scan pointer-events-none absolute inset-x-0 -top-[40%] h-[40%] bg-gradient-to-b from-transparent via-sage/20 to-transparent" />

        {captured && (
          <span className="absolute left-1/2 top-2.5 -translate-x-1/2 rounded-full bg-sage px-2.5 py-1 font-mono text-[10.5px] tracking-wide text-ink">
            CAPTURED
          </span>
        )}
        <span className="absolute inset-x-2.5 bottom-2.5 w-fit rounded-lg bg-ink/60 px-2 py-1 font-mono text-[10.5px] uppercase tracking-wide text-parchment">
          {target?.series || "Unknown series"}
        </span>
      </button>

      <div>
        <h3 className="font-display text-2xl leading-none tracking-wide text-parchment">
          {target?.character || "Unidentified cosplayer"}
        </h3>
        <p className="mt-1 font-body text-sm text-parchment/60">
          {target?.name ? `From ${target?.series}` : "Unidentified series"}
        </p>
      </div>

      <button
        onClick={handleCaptureClick}
        disabled={captured}
        className={
          captured
            ? "flex w-full items-center justify-center gap-2 rounded-xl border border-sage bg-ink py-3 font-body text-[14.5px] font-semibold text-sage"
            : "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-flare py-3 font-body text-[14.5px] font-semibold text-ink transition hover:bg-flare-dim active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-light"
        }
      >
        <Camera size={17} strokeWidth={2.25} />
        {captured ? "Logged" : "Capture"}
      </button>
    </li>
  );
}