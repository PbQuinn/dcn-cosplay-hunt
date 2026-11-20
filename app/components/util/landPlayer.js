"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function landPlayer(conventionId, playerUid) {
    // Set persistent cookie
    const cookieStore = await cookies();

    cookieStore.set("hunter_app_uid", playerUid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
    });

    // Send the player directly to their page.
    redirect(`/c/${conventionId}/player/${playerUid}`);
}