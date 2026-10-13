"use client";

import { useState, useEffect } from "react";
import { loadConventions } from "../actions/convention";
import { useAdminSession } from "@/lib/useAdminSession";
import { supabase } from "@/lib/supabaseClient";
import ConventionList from "./components/ConventionList";
import ConventionForm from "./components/ConventionForm";

export default function AdminPage() {
    const { session, loading } = useAdminSession();
    const [conventions, setConventions] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!session) return;
        loadConventionsFromDb();
    }, [session]);

    async function loadConventionsFromDb() {
        setFetching(true);
        const data = await loadConventions();
        setConventions(data ?? []);
        setFetching(false);
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
                    <h1 className="text-4xl font-bold">Conventions</h1>
                </div>
                <button className="btn-secondary" onClick={handleSignOut}>
                    Sign out
                </button>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
                <ConventionList conventions={conventions} fetching={fetching} />
                <ConventionForm
                    onConventionCreated={loadConventionsFromDb}
                />
            </div>
        </div>
    );
}