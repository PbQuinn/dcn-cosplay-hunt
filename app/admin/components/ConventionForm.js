"use client";

import { useState } from "react";
import { createConvention } from "@/app/actions/convention";

export default function ConventionForm({ onConventionCreated }) {
    const [form, setForm] = useState({
        name: "",
        start_date: "",
        end_date: "",
        theme: "",
        venue: "",
        address: "",
        stand_location: "",
        icon: null,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleCreate(e) {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("start_date", form.start_date);
            formData.append("end_date", form.end_date);
            formData.append("theme", form.theme);
            formData.append("venue", form.venue);
            formData.append("address", form.address);
            formData.append("stand_location", form.stand_location);
            formData.append("icon", form.icon);

            await createConvention(formData);
        } catch (err) {
            setError(err.message);
            setSaving(false);
            return;
        }


        setSaving(false);
        if (onConventionCreated) {
            onConventionCreated();
        }
    }

    function updateForm(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handlePhotoChange(e) {
        updateForm("icon", e.target.files?.[0] ?? null);
    }

    return (
        <section>
            <h2 className="mb-4 font-display text-xl font-bold">Create a convention</h2>
            <form onSubmit={handleCreate} className="card-shell space-y-4">
                <div>
                    <label className="eyebrow mb-2 block" htmlFor="name">
                        Name
                    </label>
                    <input
                        id="name"
                        className="field-input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="eyebrow mb-2 block" htmlFor="theme">
                        Theme
                    </label>
                    <input
                        id="theme"
                        className="field-input"
                        value={form.theme}
                        onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    />
                </div>
                <div>
                    <label className="eyebrow mb-2 block" htmlFor="venue">
                        Venue
                    </label>
                    <input
                        id="venue"
                        className="field-input"
                        value={form.venue}
                        onChange={(e) => setForm({ ...form, venue: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="eyebrow mb-2 block" htmlFor="address">
                        Address
                    </label>
                    <input
                        id="address"
                        className="field-input"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="eyebrow mb-2 block" htmlFor="stand_location">
                        DCN stand location
                    </label>
                    <input
                        id="stand_location"
                        className="field-input"
                        value={form.stand_location}
                        onChange={(e) => setForm({ ...form, stand_location: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="min-w-0">
                        <label className="eyebrow mb-2 block" htmlFor="start_date">
                            Starts
                        </label>
                        <input
                            id="start_date"
                            type="datetime-local"
                            className="field-input w-full"
                            value={form.start_date}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="min-w-0">
                        <label className="eyebrow mb-2 block" htmlFor="end_date">
                            Ends
                        </label>
                        <input
                            id="end_date"
                            type="datetime-local"
                            className="field-input w-full"
                            value={form.end_date}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="eyebrow mb-2 block" htmlFor="photo">
                        Upload convention logo
                    </label>
                    <input
                        id="icon"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="block w-full rounded-lg border border-parchment/10 bg-parchment/5 p-3 text-sm text-parchment/70 file:mr-4 file:rounded-md file:border-0 file:bg-parchment/10 file:px-4 file:py-2 file:text-sm file:text-parchment"
                    />
                </div>

                {error && <p className="text-sm text-flare">{error}</p>}

                <button className="btn-primary" type="submit" disabled={saving}>
                    {saving ? "Creating…" : "Create convention"}
                </button>
            </form>
        </section>
    );
}