"use client";

import { useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// 4-digit code entry
// ---------------------------------------------------------------------------
export function CodeDigitsInput({ value, onChange, disabled, autoFocus, onSubmit }) {
  const refs = useRef([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function handleChange(i, e) {
    const digit = e.target.value.replace(/[^0-9]/g, "").slice(-1);
    const next = value.split("");
    next[i] = digit;
    const joined = next.join("").slice(0, 4);
    onChange(joined);
    if (digit && refs.current[i + 1]) refs.current[i + 1].focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    } else if (e.key === "Backspace" && !value[i] && refs.current[i - 1]) {
      refs.current[i - 1].focus();
    }
  }

  return (
    <div className="my-5 flex justify-center gap-3">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Digit ${i + 1} of 4`}
          className="h-16 w-14 rounded-xl border border-parchment/15 bg-ink text-center font-mono text-3xl text-parchment caret-flare focus:border-flare focus:outline-none focus:ring-2 focus:ring-flare/25 disabled:opacity-50"
        />
      ))}
    </div>
  );
}