"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabaseServer";
import { NR_TARGETS } from "@/lib/constants";
import { getNewTarget } from "./target";
import { stringFromTargetList } from "@/lib/targetList";

export async function createPlayer(conventionId, formData) {
    const name = formData.get("name");
    const contact = formData.get("contact");
    const description = formData.get("description");
    const invisible = formData.get("invisible") === "true";
    const character = formData.get("character");
    const series = formData.get("series");
    const photo = formData.get("photo");

    // Validate
    if (!name) {
        throw new Error("Please fill in all required fields.");
    }
    if (!invisible && (!(photo instanceof File) && !(character instanceof File) && !(series instanceof File))) {
        throw new Error("Please fill in all required fields.");
    }

    // Generate the player's permanent identifier on the server.
    const appUid = randomUUID();
    let photoPath = null;

    // Upload photo
    if (!invisible && photo instanceof File) {
        const extension =
            photo.name.split(".").pop()?.toLowerCase() || "jpg";

        photoPath = `${appUid}.${extension}`;

        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from("hunter-photos")
            .upload(photoPath, buffer, {
                contentType: photo.type,
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error(uploadError);
            throw new Error("Could not upload photo.");
        }
    }

    let targetList = [];
    for (let i = 0; i < NR_TARGETS; i++) {
        let {newTarget} = await getNewTarget(conventionId, appUid, []);
        if (newTarget) {
            targetList.push(newTarget);
        }
    }

    const newRow = {
        // Database fields
        convention_id: conventionId,
        app_uid: appUid,
        code: Math.ceil(Math.random() * 9999),
        targets: stringFromTargetList(targetList),
        created_at: new Date().toISOString(),
        // User provided fields
        name: name?.toString().trim() || "",
        contact: contact?.toString().trim() || "",
        character: character?.toString().trim() || "",
        series: series?.toString().trim() || "",
        description: description?.toString().trim() || "",
        invisible,
        image_url: photoPath,

    }

    const { error } = await supabase.from("players").insert(newRow);

    if (error) {
        if (photoPath) {
            await supabase.storage
                .from("hunter-photos")
                .remove([photoPath]);
        }
        console.error(error);
        throw new Error("Could not create your player.");
    } else {
        // Set a persistent cookie.
        const cookieStore = await cookies();

        cookieStore.set("hunter_app_uid", appUid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",

            // 1 year
            maxAge: 60 * 60 * 24 * 365,

            path: "/",
        });

        // Send the player directly to their page.
        redirect(`/c/${conventionId}/player/${appUid}`);
    }
}

