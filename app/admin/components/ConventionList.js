"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { formatNumberDate } from "@/lib/formatDateTime";
import { deleteConvention } from "@/app/actions/convention";
import { Modal, ModalCloseButton } from "@/app/c/[conventionId]/player/[playerUid]/components/ui/Modal";

export default function ConventionList({ conventions, fetching, onConventionDeleted }) {
    const [conventionToDelete, setConventionToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    async function handleDeleteConfirm() {
        if (!conventionToDelete) return;

        setDeleting(true);
        const error = await deleteConvention(conventionToDelete.id);

        setDeleting(false);
        if (!error) {
            setConventionToDelete(null);
            if (onConventionDeleted) {
                onConventionDeleted();
            }
        } else {
            console.error("Failed to delete convention:", error.message);
        }
    }

    return (
        <section>
            <h2 className="mb-4 font-display text-xl font-bold">View existing</h2>
            {fetching && <p className="text-parchment/50">Loading…</p>}
            {!fetching && conventions.length === 0 && (
                <div className="card-shell">
                    <p className="text-sm text-parchment/60">
                        No conventions yet — create your first one.
                    </p>
                </div>
            )}
            <ul className="space-y-3">
                {conventions.map((c) => (
                    <li key={c.id} className="card-shell flex items-center justify-between p-0 overflow-hidden">
                        <Link
                            href={`/admin/conventions/${c.id}`}
                            className="flex-1 p-4 transition-colors hover:text-flare"
                        >
                            <span className="font-bold">{c.name}</span>
                            <span className="ml-2 font-mono text-xs text-parchment/40">
                                {formatNumberDate(c.start_date)} – {formatNumberDate(c.end_date)}
                            </span>
                        </Link>

                        <div className="flex items-center pr-4">
                            <button
                                type="button"
                                onClick={() => setConventionToDelete(c)}
                                aria-label={`Delete ${c.name}`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/80 text-white transition hover:bg-red-600 active:scale-95"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {conventionToDelete && (
                <Modal labelledBy="delete-convention-title" onClose={() => setConventionToDelete(null)}>
                    <div className="relative pt-1 text-center">
                        <ModalCloseButton onClose={() => setConventionToDelete(null)} />

                        <h3 id="delete-convention-title" className="font-display text-2xl font-bold mb-3 text-parchment mt-2">
                            Delete Convention?
                        </h3>
                        <p className="font-body text-sm text-parchment/70 mb-6">
                            Are you sure you want to delete <b className="text-parchment">{conventionToDelete.name}</b>? This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-center gap-3 pb-2">
                            <button
                                type="button"
                                className="btn-secondary px-4 py-2 text-sm"
                                onClick={() => setConventionToDelete(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Yes, delete"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </section>
    );
}