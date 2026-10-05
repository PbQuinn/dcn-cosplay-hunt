"use client";

import { useState } from "react";
import { Eyebrow } from "../ui/Eyebrow";
import { Avatar } from "../ui/Avatar";
import { ModalCloseButton } from "../ui/Modal";
import { updatePlayerVisibility, removePlayerPhoto } from "@/app/actions/target";

export function HunterProfileContent({ hunter, score, photoUrl, onClose, onPhotoDeleted }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [currentVisibilityStatus, setCurrentVisibilityStatus] = useState(hunter?.invisible);
    const [isUpdating, setIsUpdating] = useState(false);

    const updateVisibilityStatus = async (status) => {
        if (!hunter?.id) return;

        setIsUpdating(true);
        try {
            const data = await updatePlayerVisibility(hunter, status);

            // Update local state so UI updates immediately
            setCurrentVisibilityStatus(status);

            // Close the confirmation modal on success
            setShowConfirm(false);
        } catch (err) {
            console.error("Failed to update status:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeletePhoto = async () => {
        await removePlayerPhoto(hunter);
        updateVisibilityStatus(true); // Set the player to invisible after deleting the photo

        // Call the parent callback to clear the state across the entire page
        if (onPhotoDeleted) {
            onPhotoDeleted();
        }

        setShowDeleteConfirm(false);
        setShowPhotoModal(false);
    };

    return (
        <div className="relative">
            <ModalCloseButton onClose={onClose} />
            <div className="mb-3.5 flex items-center gap-3.5">
                {!hunter.invisible ? (
                    <button
                        type="button"
                        onClick={() => photoUrl && setShowPhotoModal(true)}
                        className="focus:outline-none focus:ring-2 focus:ring-parchment/50 rounded-2xl transition-transform active:scale-95"
                        title="Click to expand photo"
                    >
                        <Avatar
                            src={photoUrl}
                            name={hunter.character}
                            className="h-16 w-16 rounded-2xl text-lg cursor-pointer hover:opacity-90 transition-opacity"
                        />
                    </button>) : (
                    <Avatar
                        src={photoUrl}
                        name={hunter.character}
                        className="h-16 w-16 rounded-2xl text-lg cursor-pointer hover:opacity-90 transition-opacity"
                    />
                )}
                <div>
                    <Eyebrow>{hunter.series || "Invisible"}</Eyebrow>
                    <h2
                        id="hunter-profile-title"
                        className="font-display text-[28px] leading-tight text-parchment"
                    >
                        {hunter.character || hunter.name}
                    </h2>
                </div>
            </div>

            {hunter.description && (
                <p className="mb-4 font-body text-[15px] italic leading-relaxed text-parchment/90">
                    "{hunter.description}"
                </p>
            )}

            <dl className="divide-y divide-parchment/10 border-t border-parchment/10">
                <DetailRow label="Hunter" value={hunter.name} />
                <DetailRow label="Code" value={hunter?.code ? String(hunter.code).padStart(4, "0") : "----"} />
                <DetailRow label="Score" value={score} />
                <DetailRow label="Contact" value={hunter.contact || "—"} />
            </dl>

            {!hunter.invisible && (
                <div className="mt-2 flex justify-center">
                    <a href="#">
                        <button
                            type="button"
                            className="btn-primary px-5 py-2.5 text-sm"
                            onClick={() => setShowConfirm(true)}
                        >
                            Go invisible
                        </button>
                    </a>
                </div>
            )}

            {/* Visibility Confirmation Modal */}
            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="relative w-full max-w-sm rounded-2xl bg-[#1e2342] p-6 text-center shadow-xl border border-parchment/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowConfirm(false)}
                            className="absolute top-4 right-4 text-parchment/60 hover:text-parchment text-lg leading-none"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>

                        <p className="font-body text-base text-parchment mt-2 mb-6">
                            Are you sure you want to go invisible? It is currently not possible to return to visible mode.
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-sm rounded-xl border border-parchment/20 text-parchment/80 hover:bg-parchment/10 transition-colors"
                            >
                                No, take me back!
                            </button>
                            <button
                                type="button"
                                onClick={() => updateVisibilityStatus(true)}
                                className="px-4 py-2 text-sm rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                                Yes, I understand
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Photo Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        className="relative w-full max-w-sm rounded-2xl bg-[#1e2342] p-6 text-center shadow-xl border border-parchment/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="absolute top-4 right-4 text-parchment/60 hover:text-parchment text-lg leading-none"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>

                        <p className="font-body text-base text-parchment mt-2 mb-6">
                            Are you sure you want to delete your photo? It is currently not possible to reupload a photo, so you will be put in invisible mode.
                        </p>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm rounded-xl border border-parchment/20 text-parchment/80 hover:bg-parchment/10 transition-colors"
                            >
                                No, keep photo
                            </button>
                            <button
                                type="button"
                                onClick={handleDeletePhoto}
                                className="px-4 py-2 text-sm rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                                Yes, delete it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Photo Modal */}
            {showPhotoModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
                    onClick={() => setShowPhotoModal(false)}
                >
                    <div
                        className="relative flex flex-col items-center max-w-lg w-full bg-[#1e2342] p-4 pt-10 rounded-2xl border border-parchment/10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowPhotoModal(false)}
                            className="absolute top-3 right-4 text-parchment/60 hover:text-parchment text-xl leading-none"
                            aria-label="Close photo"
                        >
                            ✕
                        </button>

                        <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl">
                            <img
                                src={photoUrl}
                                alt={hunter.character}
                                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
                            />
                        </div>

                        <div className="w-full flex justify-end mt-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 text-sm rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                                Delete my photo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}