"use client";

import Link from "next/link";

export default function AboutSection({ conventionName }) {
    return (
        <>
            <section className="mx-auto max-w-4xl px-6 py-8">
                <div className="card-shell">
                    <p className="eyebrow mb-3">The Game</p>
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">
                        Welcome to the Cosplay Hunt!
                    </h2>

                    <div className="mt-6 space-y-4 text-parchment/70">
                        <p>
                            Today you are going on a quest to find as many cosplayers as possible at{" "}
                            {conventionName}.
                        </p>
                        <p>
                            Sign up and jump into the world where you are a Hunter. Look for other participating
                            cosplayers and exchange personal codes to score points.
                        </p>
                        <p>
                            Show off your cosplay, make new friends, and have a wonderful time at the convention!
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-6 py-2">
                <div className="card-shell">
                    <p className="eyebrow mb-3">Who are we?</p>
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">
                        Dynamo Cosplay Nexus
                    </h2>

                    <img
                        src="https://hyzullnybsghptluvbrw.supabase.co/storage/v1/object/public/dcn-branding/dcn_logo_sticker.png"
                        alt="Dynamo Cosplay Nexus Logo"
                        className="mx-auto block h-auto w-4/5"
                    />

                    <div className="mt-6 space-y-4 text-parchment/70">
                        <p>
                            The Dynamo Cosplay Nexus is a cosplay community run by volunteers in collaboration with
                            Dynamo Eindhoven. We host monthly activities to create a safe space for cosplayers to
                            connect.
                        </p>

                        <div className="flex justify-center gap-6 pt-4">
                            <Link href="https://www.instagram.com/dynamocosplaynexus/" className="relative aspect-square flex-1">
                                <img
                                    src="https://hyzullnybsghptluvbrw.supabase.co/storage/v1/object/public/socials-icons/instagram.png"
                                    alt="Follow us on Instagram!"
                                    className="mx-auto block h-auto w-[70%] rounded-lg object-cover transition-opacity hover:opacity-80"
                                />
                            </Link>
                            <Link href="https://discord.gg/NTJjw5C6Ed" className="relative aspect-square flex-1">
                                <img
                                    src="https://hyzullnybsghptluvbrw.supabase.co/storage/v1/object/public/socials-icons/discord.png"
                                    alt="Join our Discord server!"
                                    className="mx-auto block h-auto w-[70%] rounded-lg object-cover transition-opacity hover:opacity-80"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}