"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAdminSession } from "@/lib/useAdminSession";
import { supabase } from "@/lib/supabaseClient";
import { approvalStatuses } from "@/lib/constants";
import LeaderBoard from "../LeaderBoard";
import { usePolling } from "@/lib/usePolling";

export default function ConventionDisplayPage({ params }) {
    const { session, loading } = useAdminSession();
    const conventionId = params.id;

    const [leaderBoard, setLeaderBoard] = useState([]);

    const loadAll = useCallback(async () => {
        // Prevent fetching if session/conventionId aren't ready
        if (!session || !conventionId) return;

        const { data: leaderboard } = await supabase
            .from("players")
            .select("*")
            .eq("convention_id", conventionId)
            .eq("approved", approvalStatuses.APPROVED)
            .order("score", { ascending: false });

        console.log("Fetching for conventionId:", conventionId);

        const { data: captures, error } = await supabase
            .from("captures")
            .select("*")
            .eq("convention_id", conventionId)
            .order("capture_time", { ascending: false });
            // .limit(3);

        if (error) {
            console.error("Supabase Query Error:", error);
        }

        console.log("Captures result:", captures);

        // Guard against empty array to prevent unnecessary or invalid queries
        const targetIds = captures?.map((c) => c.target_id) ?? [];
        const hunterIds = captures?.map((c) => c.hunter_id) ?? [];

        const { data: targets } = await supabase
            .from("players")
            .select("*")
            .in("id", targetIds);

        const { data: hunters } = await supabase
            .from("players")
            .select("*")
            .in("id", hunterIds);

        setLeaderBoard(leaderboard ?? []);
    }, [conventionId, session]);

    // Poll loadAll every 5000ms (5s) only when session exists, otherwise pass null to pause
    usePolling(loadAll, session ? 5000 : null);

    if (loading || !session) {
        return (
            <div className="flex h-screen items-center justify-center p-[5vh]">
                <p className="text-parchment/50">Loading…</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden p-[5vh_5vw]">
            <p className="eyebrow mb-0.1 mt-1 text-4xl justify-center text-center">Cosplay Hunt</p>

            <div className="grid h-full grid-cols-2 gap-8">
                {/* Left Column */}
                <section className="flex h-full flex-col items-center justify-center text-center border-r border-gray-700">
                    <p className="eyebrow mb-3 text-xl">Leaderboard</p>
                    <div className="w-full">
                        <LeaderBoard leaderBoard={leaderBoard} displayAmount={10} />
                    </div>

                    <p className="eyebrow mb-3 mt-6 text-xl">How to play</p>
                    <ol className="list-inside list-decimal space-y-0.1 text-center">
                        <li className="flex flex-col items-center">
                            <span>Go to dynamocosplaynexus.nl/cosplay-hunt or scan the QR code:</span>
                            <img
                                src="https://hyzullnybsghptluvbrw.supabase.co/storage/v1/object/public/dcn-branding/cosplay-hunt-qr.png"
                                alt="Cosplay Hunt QR Code"
                                className="mt-2 h-48 w-48 rounded-lg object-contain"
                            />
                        </li>
                        <li>Upload your selfie</li>
                        <li>Look for your targets</li>
                        <li>Enter their code</li>
                        <li>Score points</li>
                    </ol>
                </section>

                {/* Right Column */}
                <section className="flex h-full flex-col items-center justify-center text-center">
                    <p className="eyebrow mb-3 text-xl">Latest captures</p>

                </section>

                {/* Return Link */}
                <Link
                    href={`/admin/conventions/${conventionId}`}
                    className="absolute bottom-6 left-6 font-mono text-xs text-parchment/40 transition-colors hover:text-parchment"
                >
                    ← Return
                </Link>
            </div>
        </div>
    );
}