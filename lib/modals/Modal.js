"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Modal shell — bottom sheet on mobile, centered dialog from sm: up
// ---------------------------------------------------------------------------
export function Modal({ onClose, labelledBy, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[86vh] w-full max-w-md overflow-y-auto border border-b-0 border-parchment/10 bg-ink-light px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-2.5 rounded-t-3xl sm:rounded-3xl sm:border-b"
      >
        <div className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-parchment/15" />
        {children}
      </div>
    </div>
  );
}

export function ModalCloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full border border-parchment/10 bg-ink text-parchment transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50"
    >
      <X size={18} strokeWidth={2.25} />
    </button>
  );
}