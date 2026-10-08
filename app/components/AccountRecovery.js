"use client";

import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { loadPlayerFromRecovery } from "@/app/actions/player";
import { formatNumber } from "@/lib/formatNumber";
import { landPlayer } from "../landPlayer";

export default function AccountRecoveryModal({ conventionId, onClose }) {
    const [recoveryCode, setRecoveryCode] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleRecoverySubmit = async (e) => {
        e.preventDefault();

        const cleanCode = recoveryCode.replace(/\D/g, "");
        if (!cleanCode) return;

        setSaving(true);
        setError("");

        try {
            const playerUid = await loadPlayerFromRecovery(cleanCode);
            await landPlayer(conventionId, playerUid);

            onClose();
            setRecoveryCode("");
        } catch (err) {
            if (isRedirectError(err)) throw err;
            console.error("Recovery failed:", err);
            setError(err?.message ?? "Invalid recovery code.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-black p-6 shadow-2xl sm:p-8">
                <button
                    type="button"
                    className="absolute right-5 top-5 text-2xl text-parchment/50 transition hover:text-parchment"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>

                <div className="mb-6 pr-8">
                    <p className="eyebrow mb-2">Account Recovery</p>
                    <h2 className="font-display text-3xl font-bold">
                        Enter recovery code
                    </h2>
                </div>

                <form onSubmit={handleRecoverySubmit} className="space-y-6">
                    <div>
                        <label htmlFor="recoveryCode" className="eyebrow mb-2 block">
                            Recovery Code
                        </label>
                        <input
                            id="recoveryCode"
                            type="text"
                            required
                            maxLength={12}
                            placeholder={`e.g. ${formatNumber("7502332991")}`}
                            value={recoveryCode}
                            onChange={(e) => setRecoveryCode(formatNumber(e.target.value))}
                            className="field-input"
                        />
                    </div>

                    {error && <p className="text-sm text-flare">{error}</p>}

                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                        >
                            {saving ? "Submitting…" : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}