"use client";

import Link from "next/link";
import { formatNumberDate } from "@/lib/formatDateTime";

export default function ConventionList({ conventions, fetching }) {
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
                    <li key={c.id}>
                        <Link
                            href={`/admin/conventions/${c.id}`}
                            className="card-shell block transition-colors hover:border-flare/50 hover:text-flare"
                        >
                            {c.name}
                            <span className="ml-2 font-mono text-xs text-parchment/40">
                                {formatNumberDate(c.start_date)} – {formatNumberDate(c.end_date)}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}