"use client";

import Link from "next/link";
import { formatTextDate, formatCompactTime } from "@/lib/formatDateTime";

export default function HeroSection({ convention, hunter, onJoinClick, onOpenRecoveryModal }) {
    const formattedDate = formatTextDate(convention.start_date);
    const startTime = formatCompactTime(convention.start_date);
    const endTime = formatCompactTime(convention.end_date);

    return (
        <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
                <div className="flex h-full w-full items-center justify-center bg-parchment/5">
                    <img
                        src={convention.logo_url}
                        alt={convention.name}
                        className="mx-auto block h-auto w-4/5 object-contain opacity-30"
                    />
                </div>
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
                <p className="eyebrow mb-4">
                    {convention.name}
                    {convention.theme && `: ${convention.theme}`}
                </p>
                <p className="eyebrow mb-4 text-white">
                    {formattedDate} {startTime} - {endTime}
                </p>
                <p className="eyebrow mb-4 text-white">{convention.venue}</p>

                <h1 className="font-display text-6xl font-bold tracking-tight sm:text-8xl">
                    Cosplay Hunt
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg text-parchment/70 sm:text-xl">
                    Find the characters. Meet the cosplayers. Complete the hunt.
                </p>

                {!hunter ? (
                    <div className="flex flex-col items-center">
                        <button
                            type="button"
                            className="btn-primary mt-10 px-8 py-4 text-lg"
                            onClick={onJoinClick}
                        >
                            Join The Game
                        </button>

                        <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
                            Lost your account? Go to the DCN stand{convention?.stand_location && ` (${convention.stand_location})`} and{" "}
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