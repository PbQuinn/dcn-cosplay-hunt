"use client";

import { useState } from "react";
import { createPlayer } from "@/app/actions/player";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { MAX_PHOTO_MB } from "@/lib/constants";

export default function JoinModal({ convention, onClose }) {
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        contact: "",
        character: "",
        series: "",
        description: "",
        invisible: false,
        photo: null,
    });

    function updateForm(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handlePhotoChange(e) {
        updateForm("photo", e.target.files?.[0] ?? null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const execId = Math.random().toString(36).substring(2, 9);
        const startTime = performance.now();
        setError("");

        if (!form.invisible && !form.photo) {
            setError("Please upload a photo, or mark yourself as invisible.");
            return;
        }

        const maxSize = MAX_PHOTO_MB * 1000000;
        if (!form.invisible && form.photo && form.photo.size > maxSize) {
            setError(
                `Your photo is too large (${(form.photo.size / 1000000).toFixed(1)} MB) and exceeds the maximum size (${MAX_PHOTO_MB} MB). Please upload a smaller photo.`
            );
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("contact", form.contact);
            formData.append("description", form.description);
            formData.append("invisible", String(form.invisible));

            if (!form.invisible) {
                formData.append("character", form.character);
                formData.append("series", form.series);
                formData.append("photo", form.photo);
            }

            await createPlayer(convention.id, formData);
        } catch (err) {
            if (isRedirectError(err)) throw err;

            const duration = (performance.now() - startTime).toFixed(2);
            console.error(`[handleSubmit:${execId}] Error after ${duration}ms:`, err);
            setError(err.message ?? "Something went wrong.");
            setSaving(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-black p-6 shadow-2xl sm:p-8">
                <button
                    type="button"
                    className="absolute right-5 top-5 text-2xl text-parchment/50 transition hover:text-parchment"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>

                <div className="mb-8 pr-8">
                    <p className="eyebrow mb-2">Join the game</p>
                    <h2 className="font-display text-3xl font-bold">Create your character</h2>
                    <p className="mt-2 text-sm text-parchment/50">
                        Enter your cosplay details so other hunters can find you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="eyebrow mb-2 block" htmlFor="participant-name">
                            Display name
                        </label>
                        <input
                            id="participant-name"
                            className="field-input"
                            type="text"
                            placeholder="Name on leaderboard"
                            value={form.name}
                            onChange={(e) => updateForm("name", e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="eyebrow mb-2 block" htmlFor="participant-contact">
                            Socials
                        </label>
                        <input
                            id="participant-contact"
                            className="field-input"
                            type="text"
                            placeholder="Instagram, Discord, E-mail, etc."
                            value={form.contact}
                            onChange={(e) => updateForm("contact", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="eyebrow mb-2 block" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            className="field-input"
                            rows={4}
                            placeholder="Anything else you'd like hunters to know..."
                            value={form.description}
                            onChange={(e) => updateForm("description", e.target.value)}
                        />
                    </div>

                    <div className="rounded-lg border border-parchment/10 p-4">
                        <label htmlFor="invisible" className="flex cursor-pointer items-start gap-3">
                            <input
                                id="invisible"
                                type="checkbox"
                                checked={form.invisible}
                                onChange={(e) => updateForm("invisible", e.target.checked)}
                                className="mt-1 h-4 w-4"
                            />
                            <span>
                                <span className="block font-bold">Invisible</span>
                                <span className="mt-1 block text-sm text-parchment/50">
                                    Hide my cosplay from the public hunt. If unchecked, you must provide a photo.
                                </span>
                            </span>
                        </label>
                    </div>

                    {!form.invisible && (
                        <>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="eyebrow mb-2 block" htmlFor="character">
                                        Character
                                    </label>
                                    <input
                                        id="character"
                                        className="field-input"
                                        type="text"
                                        placeholder="Character name"
                                        value={form.character}
                                        onChange={(e) => updateForm("character", e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="eyebrow mb-2 block" htmlFor="series">
                                        Series
                                    </label>
                                    <input
                                        id="series"
                                        className="field-input"
                                        type="text"
                                        placeholder="Anime, game, movie, etc."
                                        value={form.series}
                                        onChange={(e) => updateForm("series", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="eyebrow mb-2 block" htmlFor="photo">
                                    Upload Selfie
                                </label>
                                <input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    required
                                    className="block w-full rounded-lg border border-parchment/10 bg-parchment/5 p-3 text-sm text-parchment/70 file:mr-4 file:rounded-md file:border-0 file:bg-parchment/10 file:px-4 file:py-2 file:text-sm file:text-parchment"
                                />
                                <p className="mt-2 text-xs text-parchment/40">
                                    This photo will be shown to other players hunting for your character.
                                </p>
                            </div>
                        </>
                    )}

                    {error && <p className="text-sm text-flare">{error}</p>}

                    <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? "Joining…" : "Join The Game"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}