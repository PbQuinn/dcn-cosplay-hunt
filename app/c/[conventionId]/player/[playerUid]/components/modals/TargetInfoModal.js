"use client";

import { useState } from "react";
import { Eyebrow } from "../ui/Eyebrow";
import { ModalCloseButton } from "../ui/Modal";
import { initialsFor } from "../utils/hunterUtils";
import { approvalStatusLabels, approvalStatuses } from "@/lib/constants";
import { updatePlayerApproval } from "@/app/actions/target";
import { CaptureButton } from "./CaptureModal";
import { DetailRow } from "../ui/DetailedRow";

// ---------------------------------------------------------------------------
// Modal contents
// ---------------------------------------------------------------------------
export function TargetInfoContent({
    target,
    onClose,
    isAdmin = false,
    closeOnAction = false,
    captured = false,
    onOpenCapture,
    onUpdateTarget
}) {
    const [errored, setErrored] = useState(false);
    const [currentApprovedStatus, setCurrentApprovedStatus] = useState(target?.approved);
    const [isUpdating, setIsUpdating] = useState(false);
    const showImage = Boolean(target?.photoUrl) && !errored;

    const handleCaptureClick = () => {
        if (onOpenCapture && target) {
            onClose(); // Close the info modal
            onOpenCapture(target); // Open the capture modal
        }
    };

    const updateApprovalStatus = async (status) => {
        if (!target?.id) {
            return;
        }

        setIsUpdating(true);
        try {
            const data = await updatePlayerApproval(target, status);

            // Update local state so UI updates immediately
            setCurrentApprovedStatus(status);

            // Optional: Inform parent component of the updated record
            if (onUpdateTarget && data?.[0]) {
                onUpdateTarget(data[0]);
            }

            if (closeOnAction) {
                onClose();
            }
        } catch (err) {
            console.error("%c[TargetInfoContent] Failed to update status:", "color: #ef4444; font-weight: bold;", err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!target) {
        return null;
    }

    return (
        <div className="relative pt-1">
            <ModalCloseButton onClose={onClose} />

            <div className="mb-4 flex aspect-[16/11] w-full items-center justify-center overflow-hidden rounded-2xl bg-ink">
                {showImage ? (
                    <img
                        src={target.photoUrl}
                        alt={target.character || "Target"}
                        onError={() => setErrored(true)}
                        className="h-full w-full object-cover object-center"
                        style={{
                            display: "flex",
                            width: "auto",
                            height: "100%",
                        }}
                    />
                ) : (
                    <span className="font-mono text-4xl text-parchment/40">
                        {initialsFor(target.character || target.name)}
                    </span>
                )}
            </div>

            <Eyebrow>{target.series || "Unknown series"}</Eyebrow>
            <h2
                id="target-info-title"
                className="mb-1 mt-0.5 font-display text-4xl text-parchment"
            >
                {target.character || "Unidentified Cosplayer"}
            </h2>

            {target.description && (
                <p className="mb-4 font-body text-[15px] italic leading-relaxed text-parchment/90">
                    "{target.description}"
                </p>
            )}

            {/* ---------------------------------------------------- */}
            {/* SHIELDED ADMIN DATA                                  */}
            {/* ---------------------------------------------------- */}
            {isAdmin ? (
                <div className="mt-4 border-t border-parchment/10 pt-2">
                    <Eyebrow className="mb-1 text-flare">Admin Details</Eyebrow>
                    <dl className="divide-y divide-parchment/10">
                        <DetailRow label="Player Name" value={target.name || "—"} />
                        <DetailRow label="Code" value={target?.code ? String(target.code).padStart(4, "0") : "----"} />
                        <DetailRow label="Contact" value={target.contact || "—"} />
                        <DetailRow
                            label="Visibility"
                            value={target.invisible ? "Invisible" : "Visible"}
                        />
                        <DetailRow
                            label="Approval"
                            value={approvalStatusLabels[currentApprovedStatus] || "-"}
                        />
                    </dl>

                    {/* Approval Buttons */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateApprovalStatus(approvalStatuses.REJECTED)}
                            className="flex-1 cursor-pointer rounded-xl border border-flare/30 bg-flare/10 px-4 py-2.5 font-body text-sm font-semibold text-flare transition-all hover:bg-flare hover:text-ink active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare/50"
                        >
                            Reject
                        </button>

                        <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateApprovalStatus(approvalStatuses.APPROVED)}
                            className="flex-1 cursor-pointer rounded-xl bg-sage px-4 py-2.5 font-body text-sm font-bold text-ink transition-all hover:bg-sage/90 hover:shadow-lg hover:shadow-sage/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            ) : (
                /* ---------------------------------------------------- */
                /* PUBLIC INSTRUCTIONS                                 */
                /* ---------------------------------------------------- */
                <div className="mt-3 space-y-4">
                    <p className="font-body text-sm leading-relaxed text-parchment/80">
                        See if you can spot {target.character || "this cosplayer"}! Once you
                        find them, ask for their 4-digit code to score points!
                    </p>

                    <CaptureButton
                        captured={captured}
                        onClick={handleCaptureClick}
                    />
                </div>

            )}
        </div>
    );
}