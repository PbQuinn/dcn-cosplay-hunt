"use client";

import { useId } from "react";
import { Modal, ModalCloseButton } from "@/lib/modals/Modal";

const VARIANT_STYLES = {
  danger: "bg-red-600/80 hover:bg-red-600 text-white",
  warning: "bg-amber-600/85 hover:bg-amber-600 text-white",
  primary: "btn-primary",
};

export default function ConfirmationModal({
  isOpen = true,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  itemName,
  confirmLabel = "Confirm",
  loadingLabel = "Processing...",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  error = null,
  labelledBy,
}) {
  const generatedId = useId();
  const headingId = labelledBy || generatedId;

  if (!isOpen) {
    return null;
  }

  const confirmButtonClass = VARIANT_STYLES[variant] || VARIANT_STYLES.danger;

  return (
    <Modal
      labelledBy={headingId}
      onClose={onClose}
      backdropClassName="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      panelClassName="relative max-h-[86vh] w-full max-w-md overflow-y-auto rounded-3xl border border-parchment/10 bg-ink-light px-6 py-5"
      handleClassName=""
    >
      <div className="relative pt-1 text-center">
        <ModalCloseButton onClose={onClose} />

        <h3
          id={headingId}
          className="font-display text-2xl font-bold mb-3 text-parchment pr-8"
        >
          {title}
        </h3>

        {(description || itemName) && (
          <p className="font-body text-sm text-parchment/70 mb-5">
            {description || (
              <>
                Are you sure you want to delete{" "}
                {itemName && <b className="text-parchment">{itemName}</b>}? This
                action cannot be undone.
              </>
            )}
          </p>
        )}

        {error && (
          <p className="text-sm text-flare mb-4 font-body">{error}</p>
        )}

        <div className="flex items-center justify-center gap-3 pb-1">
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors disabled:opacity-50 ${confirmButtonClass}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}