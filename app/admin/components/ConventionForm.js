"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ConventionForm({ onConventionCreated }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleCreate(e) {
        e.preventDefault();
        setSaving(true);
        setError("");

        const { error } = await supabase.from("conventions").insert({
            name: form.name.trim(),
            description: form.description.trim() || null,
            start_date: form.start_date,
            end_date: form.end_date,
        });

        if (error) {
            setError(error.message);
            setSaving(false);
            return;
        }

        setForm({ name: "", description: "", start_date: "", end_date: "" });
        setSaving(false);
        if (onConventionCreated) {
            onConventionCreated();
        }
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
                    <label className="eyebrow mb-2 block" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        className="field-input"
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label className="eyebrow mb-2 block" htmlFor="start_date">
                            Starts
                        </label>
                        <input
                            id="start_date"
                            type="date"
                            className="field-input"
                            value={form.start_date}
                            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="eyebrow mb-2 block" htmlFor="end_date">
                            Ends
                        </label>
                        <input
                            id="end_date"
                            type="date"
                            className="field-input"
                            value={form.end_date}
                            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-flare">{error}</p>}

                <button className="btn-primary" type="submit" disabled={saving}>
                    {saving ? "Creating…" : "Create convention"}
                </button>
            </form>
        </section>
    );
}