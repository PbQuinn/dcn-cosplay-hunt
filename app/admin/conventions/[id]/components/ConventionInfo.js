import { Eyebrow } from "app/c/[conventionId]/player/[playerUid]/components/ui/Eyebrow";
import { formatDateTime } from "@/lib/formatDateTime";
import Avatar from "@/app/c/[conventionId]/player/[playerUid]/components/ui/Avatar";
import { X } from "lucide-react";
import { InputRow } from "@/lib/visual/InputRow";

export function ConventionInfo({ convention }) {

    function handlePhotoChange(e) {
        updateForm("photo", e.target.files?.[0] ?? null);
    }

    return (
        <div className="mt-4">

            <div className="grid w-full min-h-0 grid-cols-2 gap-4 items-stretch">
                <section className="flex min-h-0 min-w-0 h-full w-full flex-col items-center justify-between gap-4 p-1 text-center">
                    <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                        <Avatar
                            src={`/c/${convention.id}/logo`}
                            name={convention?.name}
                            className="h-full max-h-80 aspect-square max-w-full rounded-xl"
                        />
                    </div>

                    <div className="w-full shrink-0 text-left">
                        <label className="eyebrow mb-2 block" htmlFor="photo">
                            Change logo
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="block w-full rounded-lg border border-parchment/10 bg-parchment/5 p-3 text-sm text-parchment/70 file:mr-4 file:rounded-md file:border-0 file:bg-parchment/10 file:px-4 file:py-2 file:text-sm file:text-parchment"
                            />
                            <button
                                type="button"
                                aria-label={`Delete ${convention.name}`}
                                onClick={{}}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/80 text-white transition hover:bg-red-600 active:scale-95"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                    </div>
                </section>

                {/* Instructions Container */}
                <section className="flex h-full w-full flex-col justify-center py-2">
                    <div className="mt-4 w-full pt-2">
                        <label className="eyebrow mb-2 block" htmlFor="photo">Convention Details</label>
                        <dl className="grid w-full grid-cols-[max-content_minmax(0,1fr)]">
                            <InputRow label="Name" value={convention?.name} name="name" placeholder="Convention name" required={true} />
                            <InputRow label="Theme" value={convention?.theme} name="theme" placeholder="Convention theme" />
                            <InputRow label="Venue" value={convention?.venue} name="venue" placeholder="Convention venue" required={true} />
                            <InputRow label="Address" value={convention?.address} name="address" placeholder="Convention address" />
                            <InputRow label="Stand location" value={convention?.stand_location} name="stand_location" placeholder="Convention stand location" required={true} />
                            <InputRow label="Start date" value={formatDateTime(convention?.start_date)} name="start_date" placeholder="Convention start date" required={true} type="datetime-local" />
                            <InputRow label="End date" value={formatDateTime(convention?.end_date)} name="end_date" placeholder="Convention end date" required={true} type="datetime-local" />
                        </dl>
                    </div>
                </section>
            </div>
        </div>
    )
}


