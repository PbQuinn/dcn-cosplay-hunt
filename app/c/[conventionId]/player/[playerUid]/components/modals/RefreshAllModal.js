"use client";

import { REFRESH_COOLDOWN_MINUTES } from "@/lib/constants";

export function RefreshAllContent({ onClose, onConfirm }) {
    return (
        <div>
            <p className="font-body text-base text-parchment mt-2 mb-6">
                Are you sure you want to refresh your entire pool? You can only do this once every {REFRESH_COOLDOWN_MINUTES} minutes!
            </p>

            {/* Side-by-side Buttons */}
            <div className="flex items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => onClose()}
                    className="px-4 py-2 text-sm rounded-xl border border-parchment/20 text-parchment/80 hover:bg-parchment/10 transition-colors"
                >
                    No, I want to keep hunting my current list!
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm()}
                    className="px-4 py-2 text-sm rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors"
                >
                    Yes, I understand
                </button>
            </div>
        </div>
    );
}