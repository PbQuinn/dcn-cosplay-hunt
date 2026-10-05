"use client";

import { ModalCloseButton } from "../ui/Modal";

// ---------------------------------------------------------------------------
// No character found, user caught call currently available characters
// ---------------------------------------------------------------------------
export function NoCharFoundModal({ onClose }) {

  return (
    <div className="relative pt-1">
      <ModalCloseButton onClose={() => onClose(false)} />


      <h2
        id="target-info-title"
        className="mb-3 mt-0.5 font-display text-4xl text-parchment"
      >
        No characters left!
      </h2>
      <p>
        It looks like you have exhausted the current target pool, well done! Come back and try to refresh in a bit to see if any new cosplayers appeared on site!
      </p>
    </div>
  );
}