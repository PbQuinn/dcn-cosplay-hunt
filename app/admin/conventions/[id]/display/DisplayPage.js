"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAdminSession } from "@/lib/useAdminSession";
import { approvalStatuses, REFRESH_PERIOD } from "@/lib/constants";
import { usePolling } from "@/lib/usePolling";
import { loadCaptures } from "@/app/actions/target";
import { loadPlayers, loadPlayerFromUid } from "@/app/actions/player";
import LeaderBoard from "../LeaderBoard";

import HowToPlaySection from "./components/HowToPlaySection";
import LatestCapturesSection from "./components/LatestCapturesSection";

export default function ConventionDisplayPage({ convention }) {
    const { session, loading } = useAdminSession();
    const conventionId = convention.id;

    const [leaderBoard, setLeaderBoard] = useState([]);
    const [latestCaptures, setCaptures] = useState([]);
    const [currentTargets, setTargets] = useState([]);
    const [currentHunters, setHunters] = useState([]);

    const loadAll = useCallback(async () => {
        if (!session || !conventionId) return;

        const players = await loadPlayers(conventionId);
        const playerMap = new Map(
            (players || []).map((p) => [p.app_uid || p.uid, p])
        );
        const leaderboard = players
            .filter((player) => player.approved === approvalStatuses.APPROVED)
            .sort((a, b) => b.score - a.score);

        const captures = await loadCaptures(conventionId);
        const approvedCaptures = (captures || []).filter((capture) => {
            const hunter = playerMap.get(capture.hunter_id);
            return hunter && hunter.approved === approvalStatuses.APPROVED;
        });
        const latestCaptures = approvedCaptures
            .sort((a, b) => new Date(b.capture_time) - new Date(a.capture_time))
            .slice(0, 3);

        const hunterIds = latestCaptures?.map((c) => c.hunter_id) ?? [];
        const targetIds = latestCaptures?.map((c) => c.target_id) ?? [];

        const fetchedHunters = await loadPlayerFromUid(hunterIds);
        const fetchedTargets = await loadPlayerFromUid(targetIds);

        const uniqueHunters = Array.isArray(fetchedHunters)
            ? fetchedHunters
            : fetchedHunters
                ? [fetchedHunters]
                : [];
        const uniqueTargets = Array.isArray(fetchedTargets)
            ? fetchedTargets
            : fetchedTargets
                ? [fetchedTargets]
                : [];

        const hunters = hunterIds.map(
            (id) =>
                uniqueHunters.find((player) => (player.app_uid || player.uid) === id) ||
                null
        );

        const targets = targetIds.map(
            (id) =>
                uniqueTargets.find((player) => (player.app_uid || player.uid) === id) ||
                null
        );

        setLeaderBoard(Array.isArray(leaderboard) ? leaderboard : []);
        setCaptures(Array.isArray(latestCaptures) ? latestCaptures : []);
        setHunters(Array.isArray(hunters) ? hunters : hunters ? [hunters] : []);
        setTargets(Array.isArray(targets) ? targets : targets ? [targets] : []);
    }, [conventionId, session]);

    usePolling(loadAll, session ? REFRESH_PERIOD * 1000 : null);

    if (loading || !session) {
        return (
            <div className="flex h-screen items-center justify-center p-[5vh]">
                <p className="text-xl text-parchment/50">Loading…</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden p-[4vh_4vw]">
            <p className="eyebrow mb-2 shrink-0 text-center text-6xl font-black">
                Cosplay Hunt
            </p>

            <div className="grid flex-1 min-h-0 grid-cols-2 gap-0">
                {/* Left Column */}
                <section className="flex h-full flex-col items-center border-r border-gray-700 pr-10 text-center">
                    <p className="eyebrow mb-2 shrink-0 text-3xl font-bold">Leaderboard</p>

                    <div className="w-full shrink-0 text-lg">
                        <LeaderBoard
                            leaderBoard={leaderBoard}
                            displayAmount={10}
                            textSize="text-lg"
                            isDisplay={true}
                        />
                    </div>

                    <HowToPlaySection />
                </section>

                {/* Right Column */}
                <LatestCapturesSection
                    currentHunters={currentHunters}
                    currentTargets={currentTargets}
                    latestCaptures={latestCaptures}
                    conventionId={conventionId}
                />

                {/* Return Link */}
                <Link
                    href={`/admin/conventions/${conventionId}`}
                    className="absolute bottom-6 left-6 font-mono text-sm text-parchment/50 transition-colors hover:text-parchment"
                >
                    ← Return
                </Link>
            </div>
        </div>
    );
}