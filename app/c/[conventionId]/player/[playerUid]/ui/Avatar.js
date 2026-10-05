"use client";

import { useState } from "react";
import { initialsFor } from "../utils/hunterUtils";

export function Avatar({ src, name, className = "h-10 w-10 rounded-full text-xs" }) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(src) && !errored;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-parchment/10 bg-ink-light ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || "Player"}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-mono tracking-wide text-parchment">
          {initialsFor(name)}
        </span>
      )}
    </div>
  );
}