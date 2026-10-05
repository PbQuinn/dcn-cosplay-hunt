"use client";

import PlayerCard from "./PlayerCard";

export default function LatestCapturesSection({
    currentHunters,
    currentTargets,
    latestCaptures,
    conventionId,
}) {
    return (
        <section className="flex h-full flex-col items-center justify-center pl-10 text-center">
            <p className="eyebrow mb-4 text-3xl font-bold">Latest captures</p>
            <div className="flex w-full flex-1 flex-col justify-evenly gap-6">
                {!Array.isArray(currentHunters) || currentHunters.length === 0 ? (
                    <p className="text-xl text-parchment/50">No recent captures yet.</p>
                ) : (
                    currentHunters.map((hunter, index) => {
                        const target = currentTargets?.[index];
                        const captureTime = latestCaptures?.[index]?.capture_time;
                        const formattedTime = captureTime
                            ? new Date(captureTime).toLocaleTimeString("en-GB", {
                                timeZone: "Europe/Amsterdam",
                                hour12: false,
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })
                            : "";

                        return (
                            <div
                                key={`capture-${index}`}
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
    );
}