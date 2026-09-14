"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAdminSession } from "@/lib/useAdminSession";

export default function AdminDashboard() {
  const { session, loading } = useAdminSession();
  const [conventions, setConventions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", start_date: "", end_date: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    loadConventions();
  }, [session]);

  async function loadConventions() {
    setFetching(true);
    const { data } = await supabase
      .from("conventions")
      .select("id, name, start_date, end_date")
      .order("start_date", { ascending: true });
    setConventions(data ?? []);
    setFetching(false);
  }

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
    loadConventions();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading || !session) {
    return <p className="text-parchment/50">Checking credentials…</p>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-3">Admin</p>
          <h1 className="text-4xl font-bold">Conventions</h1>
        </div>
        <button className="btn-secondary" onClick={handleSignOut}>
          Sign out
        </button>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-xl font-bold">View existing</h2>
          {fetching && <p className="text-parchment/50">Loading…</p>}
          {!fetching && conventions.length === 0 && (
            <div className="card-shell">
              <p className="text-sm text-parchment/60">No conventions yet — create your first one.</p>
            </div>
          )}
          <ul className="space-y-3">
            {conventions.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/conventions/${c.id}`}
                  className="card-shell block transition-colors hover:border-flare/50 hover:text-flare"
                >
                  {c.name}
                  <span className="ml-2 font-mono text-xs text-parchment/40">
                    {c.start_date} – {c.end_date}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-bold">Create a convention</h2>
          <form onSubmit={handleCreate} className="card-shell space-y-4">
            <div>
              <label className="eyebrow mb-2 block" htmlFor="name">Name</label>
              <input
                id="name"
                className="field-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block" htmlFor="description">Description</label>
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
                <label className="eyebrow mb-2 block" htmlFor="start_date">Starts</label>
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
                <label className="eyebrow mb-2 block" htmlFor="end_date">Ends</label>
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
      </div>
    </div>
  );
}
