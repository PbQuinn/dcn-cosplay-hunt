"use client";

export default function HowToPlaySection() {
    return (
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
                            <span>
                                Go to <b className="text-3xl font-extrabold">dynamocosplaynexus.nl</b>
                                <br />
                                or scan the QR code
                            </span>
                        </li>
                        <li>Upload your selfie</li>
                        <li>Look for your targets</li>
                        <li>Enter their code</li>
                        <li>Score points</li>
                    </ol>
                </section>
            </div>
        </div>
    );
}