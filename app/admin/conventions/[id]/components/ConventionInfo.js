import { useState } from "react";
import { Eyebrow } from "app/c/[conventionId]/player/[playerUid]/components/ui/Eyebrow";
import { DetailRow } from "app/c/[conventionId]/player/[playerUid]/components/ui/DetailedRow";
import { formatDateTime } from "@/lib/formatDateTime";

export function ConventionInfo({ convention }) {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="mt-4">
            <p className="eyebrow mb-1 shrink-0 text-3xl font-bold">Convention Information</p>

            <div className="grid w-full min-h-0 grid-cols-2 gap-0 items-start">
                <section className="flex h-full w-full items-center justify-center p-1 text-center overflow-hidden">
                    {convention?.id && convention?.logo_url && !imgError && (
                        <img
                            src={`/c/${convention.id}/logo`}
                            alt={convention?.name || ""}
                            onError={() => setImgError(true)}
                            className="mx-auto block h-auto w-4/5 object-contain"
                        />
                    )}
                </section>

                {/* Instructions Container */}
                <section className="flex h-full flex-col items-center justify-center py-2 text-center">
                    <div className="mt-4 border-t border-parchment/10 pt-2">
                        <Eyebrow className="mb-1 text-flare">Convention Details</Eyebrow>
                        <dl className="divide-y divide-parchment/10">
                            <DetailRow label="Name" value={convention?.name || "—"} />
                            <DetailRow label="Theme" value={convention?.theme || "—"} />
                            <DetailRow label="Venue" value={convention?.venue || "—"} />
                            <DetailRow label="Address" value={convention?.address || "—"} />
                            <DetailRow label="Stand location" value={convention?.stand_location || "—"} />
                            <DetailRow label="Start date" value={formatDateTime(convention?.start_date) || "—"} />
                            <DetailRow label="End date" value={formatDateTime(convention?.end_date) || "—"} />
                        </dl>
                    </div>
                </section>
            </div>
        </div>
    )
}


