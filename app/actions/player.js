"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabaseServer";
import { requestFreshTargetAssignment } from "./target";
import { stringFromTargetList } from "@/lib/targetList";

export async function createPlayer(conventionId, formData) {
    const name = formData.get("name");
    const contact = formData.get("contact");
    const description = formData.get("description");
    const invisible = formData.get("invisible") === "true";
    const character = formData.get("character");
    const series = formData.get("series");
    const photo = formData.get("photo");

    // Name is required
    if (!name) {
        throw new Error("Please fill in all required fields.");
    }
    // Validate all fields for "null"
    if (!!name && name === null) {
        throw new Error("The entered name cannot be processed, please change it");
    }
    if (!!contact && contact === null) {
        throw new Error("The entered contact cannot be processed, please change it, or leave it blank");
    }
    if (!!description && description === null) {
        throw new Error("The entered description be processed, please change it, or leave it blank");
    }
    // If visible, all other fields are also required
    if (!invisible && (!(photo instanceof File) || !(character) && !(series))) {
        throw new Error("Please fill in all required fields.");
    }
    // If visible, also validate all fields for "null"
    if (!invisible && character === null) {
        throw new Error("The entered character name cannot be processed, please change it");
    }
    if (!invisible && series === null) {
        throw new Error("The entered series name cannot be processed, please change it");
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

    const newRow = {
        // Database fields
        convention_id: conventionId,
        app_uid: appUid,
        code: Math.ceil(Math.random() * 9999),
        targets: "", // Character is populated with targets only upon succesful creation
        created_at: new Date().toISOString(),
        // User provided fields
        name: name.toString().trim() || "",
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

        await requestFreshTargetAssignment(conventionId, appUid);
        

        // Send the player directly to their page.
        redirect(`/c/${conventionId}/player/${appUid}`);
    }
}

export async function updatePlayerLastRefresh(playerUid, status) {
  const { data, error } = await supabase
    .from("players")
    .update({ last_refresh: status })
    .eq("app_uid", playerUid)
    .select();

  if (error) {
    console.error("%c[DB] Supabase update failed:", "color: #ef4444; font-weight: bold;", error);
    throw new Error(error.message);
  }

  return data;
}