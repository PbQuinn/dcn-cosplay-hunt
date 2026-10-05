"use client"

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAdminSession } from "@/lib/useAdminSession";
import { approvalStatuses, REFRESH_PERIOD } from "@/lib/constants";
import LeaderBoard from "../LeaderBoard";
import { usePolling } from "@/lib/usePolling";
import { loadCaptures } from "@/app/actions/target";
import { loadPlayers, loadPlayerFromUid } from "@/app/actions/player";

// Helper function to resolve photo URL using the dynamic route
function getPlayerPhotoUrl(player, conventionId) {
    if (!player) return null;

    const uid = player.app_uid || player.uid;
    const cId = conventionId || player.convention_id;

    if (cId && uid) {
        return `/c/${cId}/player/${uid}/photo`;
    }

    // Fallback to image_url if conventionId or uid isn't available
    return player.image_url || null;
}

function Avatar({ src, name, isInvisible, className = "h-28 w-28 rounded-2xl" }) {
    const [errored, setErrored] = useState(false);
    const showImage = Boolean(src) && !errored && !isInvisible;

    // Simple initial generator
    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "?";

    return (
        <div
            className={`flex shrink-0 items-center justify-center overflow-hidden border border-parchment/10 bg-ink-light ${className}`}
        >
            {showImage ? (
                <img
                    src={src}
                    alt={name || "Player"}
                    onError={() => setErrored(true)}
                    className="h-full w-full object-cover"
                />
            ) : (
                <span className="font-mono text-2xl font-bold tracking-wide text-parchment/70">
                    {initials}
                </span>
            )}
        </div>
    );
}

// Sub-component for individual equal-sized player cards
function PlayerCard({ player, conventionId }) {
    if (!player) return <div className="w-40" />;

    const isInvisible = Boolean(player.invisible);
    const photoUrl = getPlayerPhotoUrl(player, conventionId);

    return (
        <div className="flex w-40 flex-col items-center text-center">
            <Avatar
                src={photoUrl}
                name={player.name}
                isInvisible={isInvisible}
                className="w-28 aspect-[9/16] rounded-xl"
            />
            <div className="mt-2 flex flex-col items-center">
                <span className="text-base font-bold text-parchment">{player.name}</span>
                {!isInvisible && player.character && (
                    <span className="text-sm text-parchment/60">as {player.character}</span>
                )}
            </div>
        </div>
    );
}

export default function ConventionDisplayPage({ convention }) {
    const { session, loading } = useAdminSession();
    const conventionId = convention.id;

    const [leaderBoard, setLeaderBoard] = useState([]);
    const [latestCaptures, setCaptures] = useState([]);
    const [currentTargets, setTargets] = useState([]);
    const [currentHunters, setHunters] = useState([]);

    const loadAll = useCallback(async () => {
        // Prevent fetching if session/conventionId aren't ready
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

        // Guard against empty array to prevent unnecessary or invalid queries
        const hunterIds = latestCaptures?.map((c) => c.hunter_id) ?? [];
        const targetIds = latestCaptures?.map((c) => c.target_id) ?? [];

        // Fetch unique players from backend
        const fetchedHunters = await loadPlayerFromUid(hunterIds);
        const fetchedTargets = await loadPlayerFromUid(targetIds);

        // Normalize fetched results into standard arrays
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

        // Re-map over the original ID lists to preserve duplicate occurrences and exact order
        const hunters = hunterIds.map((id) =>
            uniqueHunters.find((player) => (player.app_uid || player.uid) === id) || null
        );

        const targets = targetIds.map((id) =>
            uniqueTargets.find((player) => (player.app_uid || player.uid) === id) || null
        );

        setLeaderBoard(Array.isArray(leaderboard) ? leaderboard : []);
        setCaptures(Array.isArray(latestCaptures) ? latestCaptures : []);
        setHunters(Array.isArray(hunters) ? hunters : hunters ? [hunters] : []);
        setTargets(Array.isArray(targets) ? targets : targets ? [targets] : []);
    }, [conventionId, session]);

    // Poll loadAll every 5000ms (5s) only when session exists, otherwise pass null to pause
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
            {/* Main Title */}
            <p className="eyebrow mb-2 shrink-0 text-center text-6xl font-black">Cosplay Hunt</p>

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

                    <div className="mt-4">
                        <p className="eyebrow mb-1 shrink-0 text-3xl font-bold">How to play</p>

                        <div className="grid w-full min-h-0 grid-cols-2 gap-0 items-start">
                            {/* QR Code Container */}
                            <section className="flex h-full w-full items-center justify-center p-1 text-center overflow-hidden">
                                <img
                                    src="https://hyzullnybsghptluvbrw.supabase.co/storage/v1/object/public/dcn-branding/cosplay-hunt-qr.png"
                                    alt="Cosplay Hunt QR Code"
                                    className="max-h-full max-w-full rounded-lg object-contain"
                                />
                            </section>

                            {/* Instructions Container */}
                            <section className="flex h-full flex-col items-center justify-center py-2 text-center">
                                <ol className="list-inside list-decimal space-y-3 text-center text-2xl font-medium leading-snug">
                                    <li>
                                        <span>Go to <b className="text-3xl font-extrabold">dynamocosplaynexus.nl</b><br />or scan the QR code</span>
                                    </li>
                                    <li>Upload your selfie</li>
                                    <li>Look for your targets</li>
                                    <li>Enter their code</li>
                                    <li>Score points</li>
                                </ol>
                            </section>
                        </div>
                    </div>
                </section>

                {/* Right Column */}
                <section className="flex h-full flex-col items-center justify-center pl-10 text-center">
                    <p className="eyebrow mb-4 text-3xl font-bold">Latest captures</p>
                    <div className="flex w-full flex-1 flex-col justify-evenly gap-6">
                        {!Array.isArray(currentHunters) || currentHunters.length === 0 ? (
                            <p className="text-xl text-parchment/50">No recent captures yet.</p>
                        ) : (
                            currentHunters.map((hunter, index) => {
                                const target = currentTargets?.[index];
                                const captureTime = latestCaptures?.[index].capture_time;
                                const formattedTime = new Date(captureTime).toLocaleTimeString("en-GB", {
                                    timeZone: "Europe/Amsterdam",
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                });

                                return (
                                    <div
                                        key={`leaderboard-${index}`}
                                        className="flex items-center justify-evenly gap-4 rounded-xl border border-parchment/10 bg-parchment/5 p-4"
                                    >
                                        {/* Hunter */}
                                        <PlayerCard player={hunter} conventionId={conventionId} />

                                        {/* Middle Capture Badge */}
                                        <div className="flex flex-col items-center font-mono text-base font-bold uppercase text-parchment/50">
                                            <span>has captured</span>
                                            <span className="mt-1 text-sm normal-case tracking-normal opacity-90">
                                                at {formattedTime}
                                            </span>
                                        </div>

                                        {/* Target */}
                                        <PlayerCard player={target} conventionId={conventionId} />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

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