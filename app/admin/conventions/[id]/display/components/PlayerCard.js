"use client";

import Avatar from "@/app/c/[conventionId]/player/[playerUid]/components/ui/Avatar";

function getPlayerPhotoUrl(player, conventionId) {
    if (!player) return null;

    const uid = player.app_uid || player.uid;
    const cId = conventionId || player.convention_id;

    if (cId && uid) {
        return `/c/${cId}/player/${uid}/photo`;
    }

    return player.image_url || null;
}

export default function PlayerCard({ player, conventionId }) {
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