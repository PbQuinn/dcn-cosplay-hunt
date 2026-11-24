"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Modal shell — centered floating dialog across viewports
// ---------------------------------------------------------------------------
export function Modal({ onClose, labelledBy, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "28rem", borderRadius: "1.5rem" }}
        className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-3xl border border-parchment/10 bg-ink-light px-5 pb-6 pt-3.5 shadow-2xl"
      >
        {children}
      </div>
    </div>,
    document.body
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