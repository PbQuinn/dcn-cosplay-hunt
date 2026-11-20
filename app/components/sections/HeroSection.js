"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    formatTextDate,
    formatCompactTime,
    getCountdownParts,
} from "@/lib/formatDateTime";

export default function HeroSection({ convention, hunter, onJoinClick, onOpenRecoveryModal }) {
    const formattedDate = formatTextDate(convention?.start_date);
    const startTime = formatCompactTime(convention?.start_date);
    const endTime = formatCompactTime(convention?.end_date);

    const [now, setNow] = useState(null);
    const wasCountingDownRef = useRef(false);
    const hasReloadedRef = useRef(false);

    useEffect(() => {
        if (!convention?.start_date) return;

        const targetMs = new Date(convention.start_date).getTime();
        if (Number.isNaN(targetMs)) return;

        const initialNow = Date.now();
        setNow(initialNow);

        if (initialNow < targetMs) {
            wasCountingDownRef.current = true;
        }

        const intervalId = setInterval(() => {
            const current = Date.now();
            setNow(current);

            if (current >= targetMs) {
                clearInterval(intervalId);

                if (wasCountingDownRef.current && !hasReloadedRef.current) {
                    hasReloadedRef.current = true;
                    window.location.reload();
                }
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [convention?.start_date]);

    const countdown =
        now === null
            ? { isStarted: true, formatted: "00:00:00:00" }
            : getCountdownParts(convention?.start_date, now);

    const handleJoinClick = (e) => {
        if (onJoinClick) {
            onJoinClick(e);
        }
    };

    return (
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
                <div className="flex h-full w-full items-center justify-center bg-parchment/5">
                    <img
                        src={convention?.id ? `/c/${convention.id}/logo` : ""}
                        alt={convention?.name}
                        className="mx-auto block h-auto w-4/5 object-contain opacity-30"
                    />
                </div>
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                <p className="eyebrow mb-4">
                    {convention?.name}
                    {convention?.theme && `: ${convention.theme}`}
                </p>
                <p className="eyebrow mb-4 text-white">
                    {formattedDate} {startTime} - {endTime}
                </p>
                <p className="eyebrow mb-4 text-white">{convention?.venue}</p>

                <h1 className="font-display text-6xl font-bold tracking-tight sm:text-8xl">
                    Cosplay Hunt
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg text-parchment/70 sm:text-xl">
                    Find the characters. Meet the cosplayers. Complete the hunt.
                </p>

                {!countdown.isStarted ? (
                    <div className="mt-10">
                        <p className="eyebrow mb-4">
                            Starts In
                        </p>
                        <p
                            className="font-mono text-4xl font-bold tracking-wider text-white tabular-nums sm:text-6xl"
                            aria-live="polite"
                        >
                            {countdown.formatted}
                        </p>
                    </div>
                ) : !hunter ? (
                    <div className="flex flex-col items-center">
                        <button
                            type="button"
                            className="btn-primary mt-10 px-8 py-4 text-lg"
                            onClick={handleJoinClick}
                        >
                            Join The Game
                        </button>

                        <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
                            Lost your account? Visit our stand{convention?.stand_location && ` (${convention.stand_location})`} and{" "}
                            <button
                                type="button"
                                className="text-primary underline hover:opacity-80"
                                onClick={onOpenRecoveryModal}
                            >
                                click here
                            </button>!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-parchment/70 sm:text-xl">
                            Welcome back, {hunter.name}
                        </p>
                        <Link
                            href={`/c/${convention.id}/player/${hunter.app_uid}`}
                            className="btn-primary mt-10 inline-block px-8 py-4 text-lg"
                        >
                            Go to my targets
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}