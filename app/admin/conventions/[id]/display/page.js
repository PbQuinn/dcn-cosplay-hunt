"use client"

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAdminSession } from "@/lib/useAdminSession";
import { approvalStatuses } from "@/lib/constants";
import LeaderBoard from "../LeaderBoard";
import { usePolling } from "@/lib/usePolling";
import { loadCaptures } from "@/app/actions/target";
import { loadPlayers, loadPlayerFromUid } from "@/app/actions/player";

// Helper function to resolve photo URL using the dynamic route
function getPlayerPhotoUrl(player, conventionId) {
    if (!player) return null;

    // Resolve app_uid or uid from player object
    const uid = player.app_uid || player.uid;
    const cId = conventionId || player.convention_id;

    if (cId && uid) {
        return `/c/${cId}/player/${uid}/photo`;
    }

    // Fallback to image_url if conventionId or uid isn't available
    return player.image_url || null;
}

function Avatar({ src, name, isInvisible, className = "h-24 w-24 rounded-2xl" }) {
    const [errored, setErrored] = useState(false);
    const showImage = Boolean(src) && !errored && !isInvisible;

    console.log(src);

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
                <span className="font-mono text-xl tracking-wide text-parchment/70">
                    {initials}
                </span>
            )}
        </div>
    );
}

// Sub-component for individual equal-sized player cards
function PlayerCard({ player, conventionId }) {
    if (!player) return <div className="w-32" />;

    const isInvisible = Boolean(player.invisible);
    const photoUrl = getPlayerPhotoUrl(player, conventionId);

    return (
        <div className="flex w-36 flex-col items-center text-center">
            <Avatar
                src={photoUrl}
                name={player.name}
                isInvisible={isInvisible}
                className="w-24 aspect-[9/16] rounded-xl"
            />
            <div className="mt-2 flex flex-col items-center">
                <span className="text-sm font-semibold text-parchment">{player.name}</span>
                {!isInvisible && player.character && (
                    <span className="text-xs text-parchment/60">as {player.character}</span>
                )}
            </div>
        </div>
    );
}

export default function ConventionDisplayPage({ params }) {
    const { session, loading } = useAdminSession();
    const conventionId = params.id;

    const [leaderBoard, setLeaderBoard] = useState([]);
    const [currentTargets, setTargets] = useState([]);
    const [currentHunters, setHunters] = useState([]);

    const loadAll = useCallback(async () => {
        // Prevent fetching if session/conventionId aren't ready
        if (!session || !conventionId) return;

        const players = await loadPlayers(conventionId);
        const leaderboard = players
            .filter((player) => player.approved === approvalStatuses.APPROVED)
            .sort((a, b) => b.score - a.score);

        const captures = await loadCaptures(conventionId);
        const latestCaptures = (captures || [])
            .sort((a, b) => new Date(b.capture_time) - new Date(a.capture_time))
            .slice(0, 3);

        // Guard against empty array to prevent unnecessary or invalid queries
        const hunterIds = latestCaptures?.map((c) => c.hunter_id) ?? [];
        const targetIds = latestCaptures?.map((c) => c.target_id) ?? [];

        const hunters = await loadPlayerFromUid(hunterIds);
        const targets = await loadPlayerFromUid(targetIds);

        // Map by ID/UID for fast lookup inside rendering
        const hMap = (hunters || []).reduce((acc, h) => ({ ...acc, [h.id || h.uid]: h }), {});
        const tMap = (targets || []).reduce((acc, t) => ({ ...acc, [t.id || t.uid]: t }), {});

        console.log(hMap);

        setLeaderBoard(Array.isArray(leaderboard) ? leaderboard : []);
        setHunters(Array.isArray(hunters) ? hunters : hunters ? [hunters] : []);
        setTargets(Array.isArray(targets) ? targets : targets ? [targets] : []);
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
                    <div className="flex w-full flex-1 flex-col justify-evenly gap-6 px-4">
                        {!Array.isArray(currentHunters) || currentHunters.length === 0 ? (
                            <p className="text-sm text-parchment/50">No recent captures yet.</p>
                        ) : (
                            [...currentHunters].reverse().map((hunter, reversedIndex) => {
                                // Find the original index to match the corresponding target correctly
                                const originalIndex = currentHunters.length - 1 - reversedIndex;
                                const target = currentTargets?.[originalIndex];

                                return (
                                    <div
                                        key={hunter?.id || hunter?.uid || originalIndex}
                                        className="flex items-center justify-evenly gap-4 rounded-xl border border-parchment/10 bg-parchment/5 p-4"
                                    >
                                        {/* Hunter */}
                                        <PlayerCard player={hunter} conventionId={conventionId} />

                                        <span className="font-mono text-sm font-bold uppercase text-parchment/40">
                                            has captured
                                        </span>

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
                    className="absolute bottom-6 left-6 font-mono text-xs text-parchment/40 transition-colors hover:text-parchment"
                >
                    ← Return
                </Link>
            </div>
        </div>
    );
}